<?php

namespace App\Jobs;

use App\Models\Vote;
use App\Models\EligibleVoter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use App\Models\ElectionResult;
use Illuminate\Support\Facades\Cache;
use App\Events\ElectionResultsUpdated;
use Illuminate\Support\Facades\Log;

class SealVoteHash implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $voteId)
    {
        $this->queue = 'vote_sealing';
    }

    public function handle(): void
    {
        $vote = Vote::with('voteDetails')->findOrFail($this->voteId);

        // Skip if already sealed (idempotent)
        if (!$vote->current_hash) {

            // get previous hash from latest vote current has
            $previousHash = Vote::where('election_id', $vote->election_id)
                ->where('id', '<', $vote->id)
                ->latest('id')
                ->value('current_hash');

            // get vote details
            $payload = $vote->voteDetails()
                ->get()
                ->sortBy('position_id')
                ->map(fn($d) => [
                    'position_id' => $d->position_id,
                    'candidate_id' => $d->candidate_id,
                ])
                ->values()
                ->toJson();


            $payloadHash = hash('sha256', $payload);
            $currentHash = hash('sha256', $payloadHash . ($previousHash ?? ''));


            // seal vote
            Vote::withoutEvents(function () use ($vote, $payloadHash, $currentHash, $previousHash) {
                $vote->update([
                    'payload_hash' => $payloadHash,
                    'previous_hash' => $previousHash,
                    'current_hash' => $currentHash,
                ]);
            });
        }

        $vote->refresh();

        // tally vote transactionally
        DB::transaction(function () use ($vote) {
            $vote = Vote::where('id', $vote->id)->lockForUpdate()->first();

            // check if vote is tallied already
            if ($vote->tallied) {
                return;
            }

            // increment election results
            foreach ($vote->voteDetails as $detail) {
                ElectionResult::firstOrCreate(
                    [
                        'election_id' => $vote->election_id,
                        'position_id' => $detail->position_id,
                        'candidate_id' => $detail->candidate_id,
                    ],
                    ['vote_count' => 0]
                )->increment('vote_count');

            }

            // Force update tallied flag bypassing events
            Vote::withoutEvents(function () use ($vote) {
                Vote::where('id', $vote->id)->update(['tallied' => true]);
            });
        });

        $this->broadcastResultsUpdate($vote);
    }

    private function broadcastResultsUpdate(Vote $vote): void
    {
        try {
            $intervalSeconds = config('services.realtime.results_broadcast_interval_seconds', 5);
            $cacheKey = "election:{$vote->election_id}:results_broadcast_at";
            $lastBroadcastAt = (int) Cache::get($cacheKey, 0);

            if (time() - $lastBroadcastAt < $intervalSeconds) {
                return;
            }

            Cache::put($cacheKey, time(), $intervalSeconds);

            $vote->loadMissing('voteDetails');
            $affectedPositionIds = $vote->voteDetails->pluck('position_id')->unique()->values();
            $affectedCandidateIds = $vote->voteDetails->pluck('candidate_id')->unique()->values();

            $candidateResults = ElectionResult::query()
                ->where('election_id', $vote->election_id)
                ->whereIn('candidate_id', $affectedCandidateIds)
                ->get(['position_id', 'candidate_id', 'vote_count']);

            $updates = $affectedPositionIds->map(function ($positionId) use ($candidateResults, $vote) {
                $positionCandidates = $candidateResults
                    ->where('position_id', $positionId)
                    ->values()
                    ->map(fn($row) => [
                        'id' => (int) $row->candidate_id,
                        'vote_count' => (int) $row->vote_count,
                    ])
                    ->toArray();

                $positionTotalVotes = (int) ElectionResult::where('election_id', $vote->election_id)
                    ->where('position_id', $positionId)
                    ->sum('vote_count');

                return [
                    'position_id' => (int) $positionId,
                    'position_total_votes' => $positionTotalVotes,
                    'candidates' => $positionCandidates,
                ];
            })->values()->toArray();

            $votesCast = (int) Vote::where('election_id', $vote->election_id)->count();
            $eligibleVoterCount = (int) EligibleVoter::where('election_id', $vote->election_id)
                ->distinct()
                ->count('student_id');

            $progressPercent = $eligibleVoterCount > 0
                ? round(($votesCast / $eligibleVoterCount) * 100, 2)
                : 0.0;

            broadcast(new ElectionResultsUpdated(
                $vote->election_id,
                $updates,
                [
                    'votesCast' => $votesCast,
                    'progressPercent' => $progressPercent,
                ]
            ));
        } catch (\Exception $e) {
            // Log broadcast errors but don't fail the job
            Log::error('Failed to broadcast election results', [
                'election_id' => $vote->election_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

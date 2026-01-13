<?php

namespace App\Jobs;

use App\Models\Vote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use App\Models\ElectionResult;

class SealVoteHash implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $voteId)
    {
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
    }
}

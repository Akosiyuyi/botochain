<?php

namespace App\Jobs;

use App\Models\Vote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

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
        if ($vote->current_hash) {
            return;
        }

        $previousHash = Vote::where('election_id', $vote->election_id)
            ->where('id', '<', $vote->id)
            ->latest('id')
            ->value('current_hash');

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

        Vote::withoutEvents(function () use ($vote, $payloadHash, $currentHash, $previousHash) {
            $vote->update([
                'payload_hash' => $payloadHash,
                'previous_hash' => $previousHash,
                'current_hash' => $currentHash,
            ]);
        });
    }
}

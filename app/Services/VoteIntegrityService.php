<?php

namespace App\Services;

use App\Models\Election;
use App\Models\Vote;

class VoteIntegrityService
{
    private const HASH_ALGO = 'sha256';

    public function verifyElection(Election $election): array
    {
        $votes = Vote::where('election_id', $election->id)
            ->orderBy('id')
            ->with('voteDetails')
            ->get();

        $previousHash = null;


        // check if votes are empty
        if ($votes->isEmpty()) {
            return [
                'valid' => true,
                'total_votes' => 0,
                'final_hash' => null,
            ];
        }


        // check each vote
        foreach ($votes as $vote) {
            // if vote is not sealed yet
            if (!$vote->current_hash || !$vote->payload_hash) {
                return [
                    'valid' => false,
                    'vote_id' => $vote->id,
                    'reason' => 'Vote not sealed yet',
                ];
            }


            // verify vote order consistency
            if ($vote->previous_hash !== $previousHash) {
                return [
                    'valid' => false,
                    'vote_id' => $vote->id,
                    'reason' => 'Previous hash mismatch',
                ];
            }


            // Rebuild payload
            $payload = $this->rebuildPayload($vote);


            $payloadHash = hash(self::HASH_ALGO, $payload);
            $expectedHash = hash(self::HASH_ALGO, $payloadHash . ($previousHash ?? ''));


            // check if there is any hash mismatch
            if (
                $vote->payload_hash !== $payloadHash ||
                $vote->previous_hash !== $previousHash ||
                $vote->current_hash !== $expectedHash
            ) {
                // Chain broken
                return [
                    'valid' => false,
                    'vote_id' => $vote->id,
                    'reason' => 'Chain broken'
                ];
            }
            // update previous hash for next vote
            $previousHash = $vote->current_hash;
        }

        return [
            'valid' => true,
            'total_votes' => $votes->count(),
            'final_hash' => $previousHash,
        ];
        // Chain intact
    }


    public function verifyVote(Election $election, Vote $vote): array
    {
        // eager load incase not yet eagerloaded
        $vote->loadMissing('voteDetails');


        // check if vote belongs to election
        if ($vote->election_id !== $election->id) {
            return [
                'valid' => false,
                'vote_id' => $vote->id,
                'reason' => 'Vote does not belong to this election',
            ];
        }


        // rebuild payload
        $payload = $this->rebuildPayload($vote);

        $payloadHash = hash(self::HASH_ALGO, $payload);
        $expectedHash = hash(self::HASH_ALGO, $payloadHash . ($vote->previous_hash ?? ''));


        // check for hash mismatch
        if ($vote->payload_hash !== $payloadHash) {
            return ['valid' => false, 'vote_id' => $vote->id, 'reason' => 'Payload hash mismatch'];
        }
        if ($vote->current_hash !== $expectedHash) {
            return ['valid' => false, 'vote_id' => $vote->id, 'reason' => 'Current hash mismatch'];
        }

        return [
            'valid' => true,
            'vote_id' => $vote->id,
            'total_votes' => $election->votes()->count(),
            'expected_payload_hash' => $payloadHash,
            'expected_current_hash' => $expectedHash,
        ];
    }

    private function rebuildPayload(Vote $vote)
    {
        $payload = $vote->voteDetails->sortBy('position_id')
            ->map(fn($details) => [
                'position_id' => $details->position_id,
                'candidate_id' => $details->candidate_id,
            ])->values()
            ->toJson();

        return $payload;
    }
}
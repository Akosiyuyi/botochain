<?php

namespace App\Services;

use App\Enums\ElectionStatus;
use App\Models\Election;
use Illuminate\Support\Facades\DB;

class ElectionFinalizationService
{

    public function __construct(
        private VoteIntegrityService $voteIntegrityService,
        private ElectionResultService $electionResultService
    ) {
    }

    public function finalize(Election $election): void
    {
        DB::transaction(function () use ($election) {
            // get fresh attributes and lock election for update
            $election->refresh();
            $election = Election::whereKey($election->id)
                ->lockForUpdate()
                ->first();


            // check if election has ended
            if ($election->status !== ElectionStatus::Ended) {
                return;
            }


            // check if there unsealed votes
            $hasUnsealedVotes = $election->votes()
                ->whereNull('current_hash')
                ->exists();

            if ($hasUnsealedVotes) {
                return; // wait for sealing jobs to finish
            }


            // Verify vote integrity
            $result = $this->voteIntegrityService->verifyElection($election);

            if (!$result['valid']) {
                $election->update([
                    'status' => ElectionStatus::Compromised,
                ]);
                return;
            }

            // Compute & persist results
            $this->electionResultService->computeAndStore($election);

            // Seal election
            $election->update([
                'status' => ElectionStatus::Finalized,
                'final_hash' => $result['final_hash'],
                'finalized_at' => now(),
            ]);
        });
    }
}

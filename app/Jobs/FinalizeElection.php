<?php

namespace App\Jobs;

use App\Services\ElectionFinalizationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Election;

class FinalizeElection implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public int $electionId)
    {
        $this->queue = 'election_finalization';
    }
    /**
     * Execute the job.
     */
    public function handle(ElectionFinalizationService $electionFinalizationService): void
    {
        // find election by id
        $election = Election::find($this->electionId);
        if (!$election) {
            return;
        }
        $electionFinalizationService->finalize($election);
    }
}

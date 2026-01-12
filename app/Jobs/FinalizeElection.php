<?php

namespace App\Jobs;

use App\Services\ElectionFinalizationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Enums\ElectionStatus;
use App\Models\Election;

class FinalizeElection implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */

    /**
     * Execute the job.
     */
    public function handle(ElectionFinalizationService $electionFinalizationService): void
    {
        // get all elections with status ended and null finalized at
        Election::where('status', ElectionStatus::Ended)
            ->whereNull('finalized_at')
            ->each(
                fn($election) =>
                $electionFinalizationService->finalize($election)
            );
    }
}

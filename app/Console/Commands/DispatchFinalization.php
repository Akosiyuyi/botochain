<?php

namespace App\Console\Commands;

use App\Models\Election;
use Illuminate\Console\Command;
use App\Enums\ElectionStatus;
use App\Jobs\FinalizeElection;

class DispatchFinalization extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'elections:dispatch-finalization';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch the finalization job process for elections';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // dispatch finalization job for each election that has ended but not finalized
        Election::where('status', ElectionStatus::Ended)
            ->whereNull('finalized_at')
            ->each(
                fn($election) =>
                FinalizeElection::dispatch($election->id)
            );
        return self::SUCCESS;
    }
}

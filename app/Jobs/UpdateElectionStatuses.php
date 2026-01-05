<?php

namespace App\Jobs;

use Illuminate\Foundation\Queue\Queueable;
use App\Models\Election;
use App\Enums\ElectionStatus;

class UpdateElectionStatuses
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $now = now();

        // Upcoming → Ongoing (normal window)
        Election::where('status', ElectionStatus::Upcoming->value)
            ->whereHas(
                'setup',
                fn($q) =>
                $q->where('start_time', '<=', $now)
                    ->where('end_time', '>', $now)
            )
            ->update(['status' => ElectionStatus::Ongoing->value]);

        // Upcoming → Ended (missed window)
        Election::where('status', ElectionStatus::Upcoming->value)
            ->whereHas(
                'setup',
                fn($q) =>
                $q->where('end_time', '<=', $now)
            )
            ->update(['status' => ElectionStatus::Ended->value]);

        // Ongoing → Ended (normal)
        Election::where('status', ElectionStatus::Ongoing->value)
            ->whereHas(
                'setup',
                fn($q) =>
                $q->where('end_time', '<=', $now)
            )
            ->update(['status' => ElectionStatus::Ended->value]);
    }
}

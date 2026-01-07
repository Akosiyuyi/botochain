<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Election;
use App\Services\EligibilityService;

class AggregateEligibleVoters extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'elections:aggregate-eligible';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate eligible_voters table for all elections';

    /**
     * Execute the console command.
     */
    public function handle(EligibilityService $service)
    {
        $upcomingElections = Election::with('positions.eligibleUnits.schoolUnit.schoolLevel')
            ->where('status', 'Upcoming')
            ->whereHas('setup', function ($q) {
                $q->whereBetween('start_time', [now(), now()->addDay()]);
            })->get();


        foreach ($upcomingElections as $upcomingElection) {
            // Skip if already aggregated 
            if ($upcomingElection->eligibility_aggregated_at) {
                continue;
            }

            // Run aggregation logic
            $service->aggregateForElection($upcomingElection);

            // Mark as aggregated 
            $upcomingElection->eligibility_aggregated_at = now(); 
            $upcomingElection->save();

            $this->info("Aggregated eligible voters for election: {$upcomingElection->title}");
        }

    }
}


<?php

namespace App\Http\Controllers\Voter;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Vote;
use App\Models\Election;
use App\Enums\ElectionStatus;
use Illuminate\Support\Facades\Auth;
use App\Services\StudentLookupService;

class VoterDashboardController extends Controller
{
    public function __construct(
        private StudentLookupService $studentLookup,
    ) {}

    /**
     * Display the dashboard.
     */
    public function dashboard()
    {
        $student = $this->studentLookup->findByUser(Auth::user());

        if (!$student) {
            return Inertia::render('Voter/Dashboard', [
                'stats' => [
                    'participated' => 0,
                    'upcoming' => 0,
                    'results_available' => 0,
                ],
                'ongoingElections' => [],
                'upcomingElections' => [],
                'recentActivity' => [],
            ]);
        }

        // Get eligible election IDs for this student
        $eligibleElectionIds = $student->eligibleVoters()
            ->distinct('election_id')
            ->pluck('election_id')
            ->toArray();

        // Elections the student has participated in
        $participated = Vote::where('student_id', $student->id)->count();

        // Ongoing elections (eligible & currently voting)
        $ongoingElections = Election::whereIn('id', $eligibleElectionIds)
            ->where('status', ElectionStatus::Ongoing)
            ->orderBy('created_at', 'desc')
            ->with('setup.colorTheme', 'schoolLevels.schoolLevel')
            ->get()
            ->map(function ($election) use ($student) {
                $hasVoted = Vote::where('election_id', $election->id)
                    ->where('student_id', $student->id)
                    ->exists();

                return [
                    'id' => $election->id,
                    'title' => $election->title,
                    'status' => $election->status->value,
                    'has_voted' => $hasVoted,
                    'image_path' => $election->setup?->colorTheme?->image_path,
                ];
            });

        // Upcoming elections (eligible & not yet started)
        $upcomingElections = Election::whereIn('id', $eligibleElectionIds)
            ->where('status', ElectionStatus::Upcoming)
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->with('setup.colorTheme', 'schoolLevels.schoolLevel')
            ->get()
            ->map(function ($election) use ($student) {
                $hasVoted = Vote::where('election_id', $election->id)
                    ->where('student_id', $student->id)
                    ->exists();

                return [
                    'id' => $election->id,
                    'title' => $election->title,
                    'status' => $election->status->value,
                    'has_voted' => $hasVoted,
                    'image_path' => $election->setup?->colorTheme?->image_path,
                ];
            });

        // Elections with results available
        $resultsAvailable = Election::whereIn('id', $eligibleElectionIds)
            ->where('status', ElectionStatus::Finalized)
            ->count();

        // Recent voting activity (last 5 votes)
        $recentActivity = Vote::where('student_id', $student->id)
            ->with('election')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($vote) {
                return [
                    'id' => $vote->id,
                    'election_title' => $vote->election?->title,
                    'voted_at' => $vote->created_at->format('M d, Y'),
                    'time_ago' => $vote->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Voter/Dashboard', [
            'stats' => [
                'participated' => $participated,
                'upcoming' => count($upcomingElections),
                'results_available' => $resultsAvailable,
            ],
            'ongoingElections' => $ongoingElections,
            'upcomingElections' => $upcomingElections,
            'recentActivity' => $recentActivity,
        ]);
    }
}


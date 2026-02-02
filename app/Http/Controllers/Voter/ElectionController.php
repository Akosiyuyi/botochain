<?php

namespace App\Http\Controllers\Voter;

use App\Enums\ElectionStatus;
use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Services\ElectionViewService;
use App\Services\StudentLookupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Vote;

class ElectionController extends Controller
{

    public function __construct(
        protected ElectionViewService $electionViewService,
        protected StudentLookupService $studentLookup,
    )
    {
    }

    /**
     * Display a listing of elections for voters.
     */
    public function index()
    {
        // Get the student using id_number
        $student = $this->studentLookup->findByUser(Auth::user());
        
        // If no student found, return empty
        if (!$student) {
            return Inertia::render('Voter/Election/Election', [
                'elections' => [
                    'ongoing'     => [],
                    'upcoming'    => [],
                    'finalized'   => [],
                    'compromised' => [],
                ],
            ]);
        }

        // Get eligible election IDs using the student's eligibleVoters relationship
        $eligibleElectionIds = $student->eligibleVoters()
            ->distinct('election_id')
            ->pluck('election_id')
            ->toArray();

        // If no eligible elections, return empty
        if (empty($eligibleElectionIds)) {
            return Inertia::render('Voter/Election/Election', [
                'elections' => [
                    'ongoing'     => [],
                    'upcoming'    => [],
                    'finalized'   => [],
                    'compromised' => [],
                ],
            ]);
        }

        // Get only elections user is eligible for with allowed statuses
        $elections = Election::whereIn('id', $eligibleElectionIds)
            ->whereIn('status', [
                ElectionStatus::Upcoming,
                ElectionStatus::Ongoing,
                ElectionStatus::Finalized,
                ElectionStatus::Compromised,
            ])
            ->with('setup.colorTheme', 'schoolLevels.schoolLevel')
            ->get()
            ->map(fn($election) => [
                ...$this->electionViewService->formatElectionListItem($election),
                'link' => route('voter.election.show', ['election' => $election->id]),
            ]);

        return Inertia::render('Voter/Election/Election', [
            'elections' => [
                'ongoing'     => $elections->filter(fn($e) => $e['status'] === ElectionStatus::Ongoing)->values()->toArray(),
                'upcoming'    => $elections->filter(fn($e) => $e['status'] === ElectionStatus::Upcoming)->values()->toArray(),
                'finalized'   => $elections->filter(fn($e) => $e['status'] === ElectionStatus::Finalized)->values()->toArray(),
                'compromised' => $elections->filter(fn($e) => $e['status'] === ElectionStatus::Compromised)->values()->toArray(),
            ],
        ]);
    }

    /**
     * Display a specific election (read-only for voters).
     */
    public function show(Election $election)
    {
        $student = $this->studentLookup->findByUser(Auth::user());
        $payload = $this->electionViewService->forShow($election, $student);
        
        // Fetch the voter's vote if it exists
        $vote = $student ? Vote::where('election_id', $election->id)
            ->where('student_id', $student->id)
            ->first() : null;

        // Reuse admin payload; voters will consume the same info (positions, schedule, etc.)
        return match ($election->status) {
            ElectionStatus::Upcoming => Inertia::render('Voter/Election/UpcomingElection', [
                'election' => $payload['election'],
                'setup' => $payload['setup'],
            ]),
            ElectionStatus::Ongoing => Inertia::render('Voter/Election/OngoingElection', [
                'election' => $payload['election'],
                'setup' => $payload['setup'],
                'results' => $payload['results'],
                'vote' => $vote,
            ]),
            ElectionStatus::Finalized => Inertia::render('Voter/Election/FinalizedElection', [
                'election' => $payload['election'],
                'setup' => $payload['setup'],
                'results' => $payload['results'],
                'vote' => $vote,
            ]),
            ElectionStatus::Compromised => Inertia::render('Voter/Election/CompromisedElection', [
                'election' => $payload['election'],
                'setup' => $payload['setup'],
                'results' => $payload['results'],
                'vote' => $vote,
            ]),
            default => abort(404),
        };
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vote;
use App\Services\StudentLookupService;
use Illuminate\Support\Facades\Auth;

class VoteHistoryController extends Controller
{
    public function __construct(
        protected StudentLookupService $studentLookup,
    )
    {
        //
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $student = $this->studentLookup->findByUser(Auth::user());
        // Fetch vote history from the database
        $votes = Vote::with('election')
            ->where('student_id', $student->id)
            ->latest()
            ->get()
            ->map(function ($vote) {
                return [
                    'id' => $vote->id,
                    'election_id' => $vote->election_id,
                    'election_title' => $vote->election?->title,
                    'created_at' => $vote->created_at->format('M d, Y h:i A'),
                ];
            });

        return inertia('Voter/Vote/VoteHistory', [
            'votes' => $votes,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Vote $vote)
    {
        $student = $this->studentLookup->findByUser(Auth::user());

        if (!$student || $vote->student_id !== $student->id) {
            abort(403);
        }

        // Eager load relationships
        $vote->load('election.positions.candidates.partylist', 'voteDetails');

        $election = $vote->election;

        // Map vote details to choices format (positionId => candidateId)
        $choices = $vote->voteDetails?->reduce(function ($carry, $detail) {
            $carry[$detail->position_id] = $detail->candidate_id;
            return $carry;
        }, []) ?? [];

        // Transform vote data for the frontend
        $positions = $election?->positions ?? collect();

        $voteData = [
            'id' => $vote->id,
            'election_title' => $election?->title ?? 'Election not found',
            'voted_at' => $vote->created_at,
            'positions' => $positions->map(function ($position) use ($choices) {
                return [
                    'id' => $position->id,
                    'name' => $position->name,
                    'candidates' => $position->candidates->map(function ($candidate) {
                        return [
                            'id' => $candidate->id,
                            'name' => $candidate->name,
                            'description' => $candidate->description,
                            'partylist' => $candidate->partylist,
                        ];
                    })->toArray(),
                ];
            })->toArray(),
            'choices' => $choices,
        ];

        return inertia('Voter/Vote/VoteHistoryDetail', [
            'vote' => $voteData,
            'election' => $election,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Voter;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Student;
use App\Models\Vote;
use App\Services\VoteService;
use App\Services\ElectionViewService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Services\StudentLookupService;

class VoteController extends Controller
{

    public function __construct(
        protected VoteService $voteService,
        protected ElectionViewService $electionViewService,
        protected StudentLookupService $studentLookup,
    ) {

    }


    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create(Election $election)
    {
        $student = $this->getVoterStudent();

        if (
            Vote::where('election_id', $election->id)
                ->where('student_id', $student->id)
                ->exists()
        ) {
            return back()->with('error', 'You have already voted in this election.');
        }

        $payload = $this->electionViewService->forShow($election, $student); // contains positions/candidates filtered by eligibility

        return Inertia::render('Voter/Vote/VotingForm', [
            'election' => $payload['election'],
            'setup' => $payload['setup'],
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Election $election)
    {
        // Validate request data
        $validated = $request->validate([
            'choices' => 'array',
            'choices.*' => 'integer|exists:candidates,id',
        ], [
            'choices.array' => 'Choices must be an array.',
            'choices.*.integer' => 'Candidate ID must be a valid number.',
            'choices.*.exists' => 'One or more selected candidates are invalid.',
        ]);

        // Get authenticated student
        $student = $this->getVoterStudent();

        try {
            $this->voteService->create($election, $validated['choices'], $student);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Grab the first error message
            $message = collect($e->errors())->flatten()->first();

            return back()->with('error', $message);
        }

        return redirect()->route('voter.election.show', $election->id)->with('success', 'Vote submitted successfully.');
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    private function getVoterStudent()
    {
        return $this->studentLookup->findByUserOrFail(Auth::user());
    }
}

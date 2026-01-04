<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Election;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CandidateController extends Controller
{

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Election $election)
    {
        // Validate request
        $validated = $request->validate([
            'partylist' => [
                'required',
                'integer',
                Rule::exists('partylists', 'id')->where('election_id', $election->id),
            ],
            'position' => [
                'required',
                'integer',
                Rule::exists('positions', 'id')->where('election_id', $election->id),
            ],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Create candidate
        $candidate = Candidate::create([
            'election_id' => $election->id,        // optional but recommended for integrity
            'partylist_id' => $validated['partylist'],
            'position_id' => $validated['position'],
            'name' => $validated['name'],
            'description' => $validated['description'],
        ]);

        return redirect()
            ->route('admin.election.show', $election->id)
            ->with('success', "Candidate {$candidate->name} added.");
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Election $election, Candidate $candidate)
    {
        // Validate request
        $validated = $request->validate([
            'partylist' => [
                'required',
                'integer',
                Rule::exists('partylists', 'id')->where('election_id', $candidate->election_id),
            ],
            'position' => [
                'required',
                'integer',
                Rule::exists('positions', 'id')->where('election_id', $candidate->election_id),
            ],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Update candidate
        $candidate->update([
            'partylist_id' => $validated['partylist'],
            'position_id' => $validated['position'],
            'name' => $validated['name'],
            'description' => $validated['description'],
        ]);

        return redirect()
            ->route('admin.election.show', $election)
            ->with('success', "Candidate {$candidate->name} updated.");
    }

    
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Election $election, Candidate $candidate)
    {
        $name = $candidate->name;
        $candidate->delete();

        return redirect()
            ->route('admin.election.show', $election)
            ->with('success', "Candidate {$name} deleted.");
    }

}

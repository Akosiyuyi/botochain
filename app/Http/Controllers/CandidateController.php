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
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('candidates', 'name')->where(function ($query) use ($election) {
                    return $query->where('election_id', $election->id);
                }),
            ],
            'description' => 'nullable|string',
        ]);

        $candidate = Candidate::create([
            'election_id' => $election->id,
            'partylist_id' => $validated['partylist'],
            'position_id' => $validated['position'],
            'name' => $validated['name'],
            'description' => $validated['description'],
        ]);

        $election->setup->refreshSetupFlags();

        return redirect()
            ->route('admin.election.show', $election->id)
            ->with('success', "Candidate {$candidate->name} added.");
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Election $election, Candidate $candidate)
    {
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
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('candidates', 'name')
                    ->where(fn($query) => $query->where('election_id', $candidate->election_id))
                    ->ignore($candidate->id),
            ],
            'description' => 'nullable|string',
        ]);

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

        $election->setup->refreshSetupFlags();

        return redirect()
            ->route('admin.election.show', $election)
            ->with('success', "Candidate {$name} deleted.");
    }

}

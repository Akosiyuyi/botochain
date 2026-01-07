<?php

namespace App\Http\Controllers\Admin;

use App\Models\Election;
use Illuminate\Http\Request;
use App\Models\Partylist;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;

class PartylistController extends Controller
{

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Election $election)
    {
        // Validate the request data
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:partylists,name,NULL,id,election_id,' . $election->id,
            'description' => 'nullable|string',
        ]);

        // Create a new partylist associated with the election
        $partylist = Partylist::create([
            'election_id' => $election->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        $election->setup->refreshSetupFlags();

        return redirect()
            ->route('admin.election.show', $election->id)
            ->with('success', "Partylist {$partylist->name} added.");
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Election $election, Partylist $partylist)
    {
        // Validate the request data
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('partylists')
                    ->where('election_id', $election->id)
                    ->ignore($partylist->id),
            ],
            'description' => 'nullable|string',
        ]);

        // Update the partylist
        $partylist->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()
            ->route('admin.election.show', $election->id)
            ->with('success', "Partylist {$partylist->name} updated.");
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Election $election, Partylist $partylist)
    {
        $partylist->delete();
        $election->setup->refreshSetupFlags();

        return redirect()
            ->route('admin.election.show', $election->id)
            ->with('success', 'Partylist removed.');
    }
}

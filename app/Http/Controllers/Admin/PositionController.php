<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PositionController extends Controller
{
    // store and destroy only


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
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Election $election)
    {
        $validated = $request->validate([
            'position' => [
                'required',
                'string',
                'max:255',
                Rule::unique('positions', 'name')->where(fn($query) => $query->where('election_id', $election->id)),
            ],
        ]);

        $election->positions()->create([
            'name' => $validated['position'],
        ]);

        return redirect()
            ->route('admin.election.show', $election->id)
            ->with('success', 'Position added.');
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
    public function destroy(Election $election, Position $position)
    {
        $position->delete();

        return redirect()
            ->route('admin.election.show', $election->id)
            ->with('success', 'Position removed.');
    }
}

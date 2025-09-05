<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Election;
use App\Models\ElectionSchoolLevel;
use App\Models\ElectionSetup;
use App\Models\ColorTheme;

class ElectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/Election/Election');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Election/CreateElectionModal');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validate input
        $validated = $request->validate([
            'title' => 'required|unique:elections,title',
            'school_levels' => 'required|array|min:1',
            'school_levels.*' => 'in:grade_school,junior_high,senior_high,college',
        ]);

        // 2. Create the election
        $election = Election::create([
            'title' => $validated['title'],
            'status' => 'pending',
        ]);

        // 3. Store eligible school levels
        foreach ($validated['school_levels'] as $level) {
            ElectionSchoolLevel::create([
                'election_id' => $election->id,
                'school_level' => $level,
            ]);
        }

        // 4. Assign a random theme
        $theme = ColorTheme::inRandomOrder()->first();

        // 5. Create election setup
        ElectionSetup::create([
            'election_id' => $election->id,
            'theme_id' => $theme->id,
            'setup_positions' => false,
            'setup_partylist' => false,
            'setup_candidates' => false,
            'setup_finalized' => false,
            'start_time' => now(),
            'end_time' => now()->addDays(7), // example
        ]);

        return redirect()->route('admin.election.index')
            ->with('success', 'Election created successfully!');
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
}

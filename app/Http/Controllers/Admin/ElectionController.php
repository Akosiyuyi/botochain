<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Models\Election;
use App\Models\ElectionSchoolLevel;
use App\Models\ElectionSetup;
use App\Models\ColorTheme;
use Carbon\Carbon;
use App\Models\SchoolLevel;
use App\Services\SchoolOptionsService;

class ElectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $elections = Election::with('setup.colorTheme', 'schoolLevels.schoolLevel')
            ->get()
            ->map(function ($election) {
                $created_at = $this->dateFormat($election);

                return [
                    'id' => $election->id,
                    'title' => $election->title,
                    'image_path' => $election->setup->colorTheme->image_url,
                    // pull names from related SchoolLevel model
                    'school_levels' => $election->schoolLevels
                        ->map(fn($esl) => $esl->schoolLevel->name)
                        ->toArray(),
                    'status' => $election->status,
                    'created_at' => $created_at,
                    'link' => route("admin.election.show", ['election' => $election->id]),
                ];
            });

        return Inertia::render(
            'Admin/Election/Election',
            [
                "elections" => $elections,
            ]
        );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $schoolLevelOptions = $this->schoolLevelOptions();
        return Inertia::render(
            'Admin/Election/ElectionCRUD/CreateElectionModal',
            [
                'schoolLevelOptions' => $schoolLevelOptions,
            ]
        );
    }

    public function store(Request $request)
    {
        // 1. Validate input
        $validated = $request->validate([
            'title' => 'required|unique:elections,title',
            'school_levels' => 'required|array|min:1',
            'school_levels.*' => 'exists:school_levels,id', // validate against IDs
        ]);

        // 2. Create the election
        $election = Election::create([
            'title' => $validated['title'],
            'status' => 'pending',
        ]);

        // 3. Store eligible school levels (foreign key IDs)
        foreach ($validated['school_levels'] as $levelId) {
            ElectionSchoolLevel::create([
                'election_id' => $election->id,
                'school_level_id' => $levelId,
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
        ]);

        return redirect()->route('admin.election.index')
            ->with('success', 'Election created successfully!');
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $election = Election::with('setup.colorTheme', 'schoolLevels.schoolLevel')
            ->findOrFail($id);

        $created_at = $this->dateFormat($election);

        $electionData = [
            'id' => $election->id,
            'title' => $election->title,
            'image_path' => $election->setup->colorTheme->image_url,
            // map through the nested relation to get names
            'school_levels' => $election->schoolLevels
                ->map(fn($esl) => $esl->schoolLevel->name)
                ->toArray(),
            'created_at' => $created_at,
        ];

        return Inertia::render('Admin/Election/ManageElection', [
            'election' => $electionData,
            'positions' => $election->positions()->oldest()->get(),
        ]);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $election = Election::with('schoolLevels.schoolLevel')->findOrFail($id);

        $electionData = [
            'id' => $election->id,
            'title' => $election->title,
            // map through the relation to get names
            'school_levels' => $election->schoolLevels
                ->map(fn($esl) => $esl->schoolLevel->id)
                ->toArray(),
        ];

        $schoolLevelOptions = $this->schoolLevelOptions();

        return Inertia::render('Admin/Election/ElectionCRUD/EditElectionModal', [
            'election' => $electionData,
            'schoolLevelOptions' => $schoolLevelOptions,
        ]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $election = Election::findOrFail($id);

        $validated = $request->validate([
            'title' => [
                'required',
                Rule::unique('elections', 'title')->ignore($id),
            ],
            'school_levels' => 'required|array|min:1',
            'school_levels.*' => 'exists:school_levels,id', // validate IDs instead of names
        ]);

        // 1. Update election itself
        $election->update([
            'title' => $validated['title'],
        ]);

        // 2. Clear existing school levels for this election
        ElectionSchoolLevel::where('election_id', $election->id)->delete();

        // 3. Store eligible school levels (foreign key IDs)
        foreach ($validated['school_levels'] as $levelId) {
            ElectionSchoolLevel::create([
                'election_id' => $election->id,
                'school_level_id' => $levelId,
            ]);
        }

        return redirect()->route('admin.election.show', $election->id)
            ->with('success', 'Election updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Election $election)
    {
        $election->delete();
        return redirect()
            ->route('admin.election.index')
            ->with('success', 'Election deleted.');
    }

    public function dateFormat(Election $election)
    {
        $created = Carbon::parse($election->created_at);
        if ($created->isToday()) {
            return 'Today';
        }
        if ($created->isYesterday()) {
            return 'Yesterday';
        }
        $days = floor($created->diffInDays(Carbon::now())); // always 2–6
        if ($days <= 6) {
            return "{$days} days ago";
        }
        return $created->format('M d, Y');
    }

    public function schoolLevelOptions()
    {
        // Fetch levels from DB and transform to {id, label, value} 
        $schoolLevelOptions = SchoolOptionsService::getSchoolLevelOptions();

        return $schoolLevelOptions;
    }
}

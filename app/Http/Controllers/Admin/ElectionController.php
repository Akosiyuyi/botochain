<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Models\Election;
use App\Services\ElectionService;
use App\Services\SchoolOptionsService;
use App\Services\ElectionViewService;

class ElectionController extends Controller
{
    /**
     * Inject application services via constructor (Dependency Injection).
     */
    public function __construct(
        protected ElectionViewService $electionViewService,
        protected ElectionService $electionService,
    ) {
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render(
            'Admin/Election/Election',
            [
                "elections" => $this->electionViewService->list(),
            ]
        );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render(
            'Admin/Election/ElectionCRUD/CreateElectionModal',
            [
                'schoolLevelOptions' => SchoolOptionsService::getSchoolLevelOptions(),
            ]
        );
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
            'school_levels.*' => 'exists:school_levels,id', // validate against IDs
        ]);

        $election = $this->electionService->create($validated);

        return redirect()->route('admin.election.index')
            ->with('success', 'Election created successfully!');
    }


    /**
     * Display the specified resource.
     */
    public function show(Election $election)
    {
        $election = $this->electionViewService->forShow($election);

        return Inertia::render('Admin/Election/ManageElection', [
            'election' => $election['election'],
            'setup' => $election['setup'],
            'schoolOptions' => $election['schoolOptions'],
        ]);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Election $election)
    {
        $electionData = $this->electionViewService->forEdit($election);

        return Inertia::render('Admin/Election/ElectionCRUD/EditElectionModal', [
            'election' => $electionData,
            'schoolLevelOptions' => SchoolOptionsService::getSchoolLevelOptions(),
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

        $election = $this->electionService->update($election, $validated);

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
}

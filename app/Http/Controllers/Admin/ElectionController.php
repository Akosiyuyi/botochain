<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ElectionStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Models\Election;
use App\Models\EligibleVoter;
use App\Services\ElectionService;
use App\Services\SchoolOptionsService;
use App\Services\ElectionViewService;
use App\Services\EligibilityService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ElectionController extends Controller
{
    /**
     * Inject application services via constructor (Dependency Injection).
     */
    public function __construct(
        protected ElectionViewService $electionViewService,
        protected ElectionService $electionService,
        protected EligibilityService $eligibilityService,
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
        $electionData = $this->electionViewService->forShow($election);

        return match ($election->status) {
            ElectionStatus::Draft => Inertia::render('Admin/Election/ManageElection', [
                'election' => $electionData['election'],
                'setup' => $electionData['setup'],
                'schoolOptions' => $electionData['schoolOptions'],
            ]),
            ElectionStatus::Upcoming => Inertia::render('Admin/Election/UpcomingElection', [
                'election' => $electionData['election'],
                'setup' => $electionData['setup'],
            ]),
            ElectionStatus::Ongoing => Inertia::render('Admin/Election/OngoingElection', [
                'election' => $electionData['election'],
                'setup' => $electionData['setup'],
                'results' => $electionData['results'],
            ]),
            ElectionStatus::Finalized => Inertia::render('Admin/Election/FinalizedElection', [
                'election' => $electionData['election'],
                'setup' => $electionData['setup'],
                'results' => $electionData['results'],
            ]),
            ElectionStatus::Compromised => Inertia::render('Admin/Election/CompromisedElection', [
                'election' => $electionData['election'],
                'setup' => $electionData['setup'],
                'results' => $electionData['results'],
            ]),
            default => abort(404),
        };
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

        // Prevent editing of elections that are ongoing or beyond
        if ($election->status === ElectionStatus::Ongoing || 
            $election->status === ElectionStatus::Ended || 
            $election->status === ElectionStatus::Finalized ||
            $election->status === ElectionStatus::Compromised) {
            return redirect()->route('admin.election.show', $election->id)
                ->with('error', 'Cannot edit election that is ongoing or has already ended.');
        }

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
        // Prevent deletion of elections that are ongoing or beyond
        if ($election->status !== ElectionStatus::Draft && $election->status !== ElectionStatus::Upcoming) {
            return redirect()->route('admin.election.index')
                ->with('error', 'Can only delete draft or upcoming elections.');
        }

        $election->delete();
        return redirect()
            ->route('admin.election.index')
            ->with('success', 'Election deleted.');
    }

    /**
     * Finalize election and save status to upcoming
     */
    public function finalize(Election $election)
    {
        $election->load('setup'); // Ensure setup is loaded
        $setup = $election->setup;

        // Check schedule validity
        if ($setup && $setup->start_time && $setup->end_time) {
            $now = Carbon::now();

            if (Carbon::parse($setup->end_time)->lt($now)) {

                $setup->start_time = null;
                $setup->end_time = null;
                $setup->save();

                $election->setup->refreshSetupFlags();

                return redirect()
                    ->route('admin.election.show', $election->id)
                    ->with('error', 'Election cannot be finalized because the schedule has already passed.');
            }

            if (Carbon::parse($setup->start_time)->lt($now)) {

                $setup->start_time = null;
                $setup->end_time = null;
                $setup->save();

                $election->setup->refreshSetupFlags();

                return redirect()
                    ->route('admin.election.show', $election->id)
                    ->with('error', 'Election cannot be finalized because the start time is already past.');
            }
        }

        // Proceed only if setup is valid
        if ($setup->canFinalize()) {
            try {
                DB::transaction(function () use ($setup, $election) {
                    // Mark setup as finalized
                    $setup->setup_finalized = true;
                    $setup->save();

                    // Aggregate eligible voters for this election
                    $this->eligibilityService->aggregateForElection($election);

                    // Update election status
                    $election->status = ElectionStatus::Upcoming;
                    $election->eligibility_aggregated_at = now();
                    $election->save();
                });
            } catch (\Exception $e) {
                return redirect()
                    ->route('admin.election.show', $election->id)
                    ->with('error', 'An error occurred while finalizing the election. Please try again.');
            }
        }

        return redirect()
            ->route('admin.election.index')
            ->with('success', 'Election finalized.');
    }


    public function restoreToDraft(Election $election)
    {
        $election->load('setup'); // Ensure setup is loaded
        $setup = $election->setup;

        // Only allow restoring if it was finalized
        if ($setup && $setup->setup_finalized) {
            // Guard: block restore if start_time is within 24 hours
            if ($setup->start_time) {
                $hoursUntilStart = Carbon::now()->diffInHours(Carbon::parse($setup->start_time), false);

                if ($hoursUntilStart <= 24) {
                    return redirect()
                        ->route('admin.election.show', $election->id)
                        ->with('error', 'Election cannot be restored to draft because the start date is less than 24 hours away.');
                }
            }

            // Proceed with restore
            try {
                DB::transaction(function () use ($setup, $election) {
                    // Delete eligible voters for this election
                    EligibleVoter::where('election_id', $election->id)->delete();

                    // Restore setup to unfinal state
                    $setup->setup_finalized = false;
                    $setup->start_time = null;
                    $setup->end_time = null;
                    $setup->save();

                    // Restore election to draft and clear aggregation flag
                    $election->status = ElectionStatus::Draft;
                    $election->eligibility_aggregated_at = null;
                    $election->save();
                });

                $election->setup->refreshSetupFlags();
            } catch (\Exception $e) {
                return redirect()
                    ->route('admin.election.show', $election->id)
                    ->with('error', 'An error occurred while restoring the election to draft. Please try again.');
            }
        }

        return redirect()->route('admin.election.index')
            ->with('success', 'Election restored to draft.');
    }

}

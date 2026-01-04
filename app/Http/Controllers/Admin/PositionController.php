<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Position;
use App\Models\PositionEligibleUnit;
use App\Http\Requests\PositionRequest;
use App\Services\PositionEligibilityService;
use Illuminate\Support\Facades\DB;

class PositionController extends Controller
{
    /**
     * Inject application services via constructor (Dependency Injection).
     */
    public function __construct(
        protected PositionEligibilityService $positionEligibilityService,
    ) {
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(PositionRequest $request, Election $election)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $election) {

            $position = $election->positions()->create([
                'name' => $validated['position'],
            ]);

            $schoolUnitIds = $this->positionEligibilityService->resolveUnitIds(
                $validated['school_levels'],
                $validated['year_levels'] ?? [],
                $validated['courses'] ?? []
            );

            PositionEligibleUnit::insert(
                $schoolUnitIds->map(fn($id) => [
                    'position_id' => $position->id,
                    'school_unit_id' => $id,
                ])->toArray()
            );
        });

        $election->setup->refreshSetupFlags();

        return redirect()
            ->route('admin.election.show', $election->id)
            ->with('success', 'Position added.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(
        PositionRequest $request,
        Election $election,
        Position $position
    ) {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $position) {

            // 1. Update position name
            $position->update([
                'name' => $validated['position'],
            ]);

            // 2. Resolve new eligible units
            $schoolUnitIds = $this->positionEligibilityService->resolveUnitIds(
                $validated['school_levels'],
                $validated['year_levels'] ?? [],
                $validated['courses'] ?? []
            );

            // 3. Clear old eligibility
            $position->eligibleUnits()->delete();

            // 4. Insert new eligibility
            PositionEligibleUnit::insert(
                $schoolUnitIds->map(fn($id) => [
                    'position_id' => $position->id,
                    'school_unit_id' => $id,
                ])->toArray()
            );
        });

        return redirect()
            ->route('admin.election.show', $election->id)
            ->with('success', 'Position updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Election $election, Position $position)
    {
        $position->delete();
        $election->setup->refreshSetupFlags();

        return redirect()
            ->route('admin.election.show', $election->id)
            ->with('success', 'Position removed.');
    }
}

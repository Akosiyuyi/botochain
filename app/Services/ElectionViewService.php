<?php

namespace App\Services;

use App\Models\Election;
use Carbon\Carbon;

class ElectionViewService
{
    /**
     * Get all elections.
     */
    public function list()
    {
        $elections = Election::with('setup.colorTheme', 'schoolLevels.schoolLevel')
            ->get()
            ->map(function ($election) {
                $created_at = $this->dateFormat($election);

                return [
                    'id' => $election->id,
                    'title' => $election->title,
                    'image_path' => $election->setup->colorTheme->image_url,
                    'school_levels' => $election->schoolLevels
                        ->map(fn($esl) => $esl->schoolLevel->name)
                        ->toArray(),
                    'status' => $election->status,
                    'created_at' => $created_at,
                    'link' => route("admin.election.show", ['election' => $election->id]),
                ];
            });

        return $elections;
    }

    /**
     * Get specified election details.
     */
    public function forShow(Election $election)
    {
        $election->load(
            'setup.colorTheme',
            'schoolLevels.schoolLevel',
            'positions.eligibleUnits.schoolUnit.schoolLevel',
            'partylists',
        );

        $created_at = $this->dateFormat($election);

        $electionData = [
            'id' => $election->id,
            'title' => $election->title,
            'image_path' => $election->setup->colorTheme->image_url,
            'school_levels' => $election->schoolLevels
                ->map(fn($esl) => [
                    'id' => $esl->schoolLevel->id,
                    'label' => $esl->schoolLevel->name,
                    'value' => $esl->schoolLevel->id,
                ])
                ->values()
                ->toArray(),
            'created_at' => $created_at,
        ];

        $positions = $election->positions->map(function ($position) {
            return [
                'id' => $position->id,
                'name' => $position->name,

                'school_levels' => $position->eligibleUnits
                    ->groupBy(fn($eu) => $eu->schoolUnit->school_level_id)
                    ->map(function ($units) {
                        $firstEu = $units->first();          // PositionEligibleUnit
                        $schoolUnit = $firstEu->schoolUnit; // SchoolUnit model
                        $level = $schoolUnit->schoolLevel;        // SchoolLevel model
        
                        return [
                            'id' => $level->id,
                            'label' => $level->name,
                            'value' => $level->id,
                            'units' => $units->map(fn($eu) => [
                                'id' => $eu->schoolUnit->id,
                                'year_level' => $eu->schoolUnit->year_level,
                                'course' => $eu->schoolUnit->course,
                            ])->values(),
                        ];
                    })
                    ->values(),
            ];
        });

        $partylists = $election->partylists->map(function ($partylist) {
            return [
                'id' => $partylist->id,
                'name' => $partylist->name,
                'description' => $partylist->description,
            ];
        });


        $yearLevelOptions = SchoolOptionsService::getYearLevelOptions();
        $courseOptions = SchoolOptionsService::getCourseOptions();

        return [
            'election' => $electionData,
            'setup' => [
                'positions' => $positions,
                'partylists' => $partylists,
            ],
            'schoolOptions' => [
                'yearLevelOptions' => $yearLevelOptions,
                'courseOptions' => $courseOptions,
            ],
        ];
    }

    /**
     * Get specified election editing details.
     */
    public function forEdit(Election $election)
    {
        $election->load('schoolLevels.schoolLevel');

        $electionData = [
            'id' => $election->id,
            'title' => $election->title,
            // map through the relation to get names
            'school_levels' => $election->schoolLevels
                ->map(fn($esl) => $esl->schoolLevel->id)
                ->toArray(),
        ];

        return $electionData;
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
}
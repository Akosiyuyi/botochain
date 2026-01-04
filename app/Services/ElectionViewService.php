<?php

namespace App\Services;

use App\Enums\ElectionStatus;
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
                // Decide what to show based on status
                $displayDate = match ($election->status) {
                    ElectionStatus::Draft => $this->dateFormat($election->created_at),
                    ElectionStatus::Upcoming => $this->dateFormat($election->setup->start_time),
                    ElectionStatus::Ongoing => $this->dateFormat($election->setup->start_time) . ' → ' . $this->dateFormat($election->setup->end_time),
                    ElectionStatus::Ended => $this->dateFormat($election->setup->end_time),
                    default => $this->dateFormat($election->created_at),
                };

                return [
                    'id' => $election->id,
                    'title' => $election->title,
                    'image_path' => $election->setup->colorTheme->image_url,
                    'school_levels' => $election->schoolLevels
                        ->map(fn($esl) => $esl->schoolLevel->name)
                        ->toArray(),
                    'status' => $election->status,
                    'display_date' => $displayDate,
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
            'candidates.position',
            'candidates.partylist',
        );

        $created_at = $this->dateFormat($election->created_at);

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

        $candidates = $election->candidates->map(function ($candidate) {
            return [
                'id' => $candidate->id,
                'partylist' => [
                    'id' => $candidate->partylist_id,
                    'name' => $candidate->partylist?->name,
                ],
                'position' => [
                    'id' => $candidate->position_id,
                    'name' => $candidate->position?->name,
                ],
                'name' => $candidate->name,
                'description' => $candidate->description,
            ];
        });


        $yearLevelOptions = SchoolOptionsService::getYearLevelOptions();
        $courseOptions = SchoolOptionsService::getCourseOptions();


        $partylistOptions = $election->partylists->map(fn($p) => [
            'id' => $p->id,
            'label' => $p->name,
            'value' => $p->id,
        ])->values();

        $positionOptions = $election->positions->map(fn($pos) => [
            'id' => $pos->id,
            'label' => $pos->name,
            'value' => $pos->id,
        ])->values();

        $setup = $election->setup;

        $startDate = $setup?->start_time
            ? Carbon::parse($setup->start_time)->toDateString()
            : null;

        $startTime = $setup?->start_time
            ? Carbon::parse($setup->start_time)->format('H:i')
            : null;

        $endTime = $setup?->end_time
            ? Carbon::parse($setup->end_time)->format('H:i')
            : null;

        $flags = [
            'position' => $setup->setup_positions,
            'partylist' => $setup->setup_partylist,
            'candidate' => $setup->setup_candidates,
            'schedule' => ($setup?->start_time && $setup?->end_time) ? true : false,
        ];


        return [
            'election' => $electionData,
            'setup' => [
                'positions' => $positions,
                'partylists' => $partylists,
                'candidates' => $candidates,
                'schedule' => [
                    'id' => $setup->id,
                    'startDate' => $startDate,
                    'startTime' => $startTime,
                    'endTime' => $endTime,
                ],
                'flags' => $flags,
            ],
            'schoolOptions' => [
                'yearLevelOptions' => $yearLevelOptions,
                'courseOptions' => $courseOptions,
                'partylistOptions' => $partylistOptions,
                'positionOptions' => $positionOptions,
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


    private function dateFormat(?Carbon $date): ?string
    {
        if (!$date) {
            return null;
        }

        if ($date->isToday()) {
            return 'Today';
        }

        if ($date->isYesterday()) {
            return 'Yesterday';
        }

        $days = floor($date->diffInDays(Carbon::now())); // always 2–6
        if ($days >=2 && $days <= 6) {
            return "{$days} days ago";
        }

        return $date->format('M d, Y');
    }

}
<?php

namespace App\Services;

use App\Models\SchoolLevel;

class SchoolOptionsService
{
    /**
     * Get school level options
     */
    public static function getSchoolLevelOptions($mode = 'id')
    {
        return SchoolLevel::all()->map(fn($level) => [
            'id' => $level->id,
            'label' => $level->name,
            'value' => $mode === 'id' ? $level->id : $level->name,
        ]);
    }

    /**
     * Get year level options grouped by school level
     */
    public static function getYearLevelOptions($mode = 'id')
    {
        $options = [];
        $levels = SchoolLevel::with('units')->get();

        foreach ($levels as $level) {
            // Group units by year_level to avoid duplicates
            $yearLevels = $level->units
                ->groupBy('year_level')
                ->map(function ($units, $year) {
                    // take the first unit's id for that year_level
                    $unit = $units->first();
                    return [
                        'id' => $unit->id,
                        'label' => $year,
                        'value' => $year,
                    ];
                })
                ->values();

            $key = $mode === 'id' ? $level->id : $level->name;
            $options[$key] = $yearLevels;
        }

        return $options;
    }

    /**
     * Get course options grouped by school level
     */
    public static function getCourseOptions($mode = 'id')
    {
        $options = [];
        $levels = SchoolLevel::with('units')->get();

        foreach ($levels as $level) {
            $courses = $level->units->whereNotNull('course')
                ->map(fn($unit) => [
                    'id' => $unit->id,
                    'label' => $unit->course,
                    'value' => $unit->course,
                ])
                ->unique('value')
                ->values();

            $key = $mode === 'id' ? $level->id : $level->name;

            if ($courses->isNotEmpty()) {
                $options[$key] = $courses;
            }
        }

        return $options;
    }

    /**
     * Convenience method to get all options together
     */
    public static function getOptions($mode = 'id')
    {
        return [
            'schoolLevelOptions' => self::getSchoolLevelOptions($mode),
            'yearLevelOptions' => self::getYearLevelOptions($mode),
            'courseOptions' => self::getCourseOptions($mode),
        ];
    }
}

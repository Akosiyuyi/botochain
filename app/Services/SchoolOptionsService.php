<?php

namespace App\Services;

use App\Models\SchoolLevel;
use App\Models\SchoolUnit;

class SchoolOptionsService
{
    /**
     * Get school level options
     */
    public static function getSchoolLevelOptions()
    {
        return SchoolLevel::all()->map(fn($level) => [
            'id' => $level->id,
            'label' => $level->name,
            'value' => $level->id,
        ]);
    }

    /**
     * Get year level options grouped by school level
     */
    public static function getYearLevelOptions()
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

            $options[$level->name] = $yearLevels;
        }

        return $options;
    }

    /**
     * Get course options grouped by school level
     */
    public static function getCourseOptions()
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

            if ($courses->isNotEmpty()) {
                $options[$level->name] = $courses;
            }
        }

        return $options;
    }

    /**
     * Convenience method to get all options together
     */
    public static function getOptions()
    {
        return [
            'schoolLevelOptions' => self::getSchoolLevelOptions(),
            'yearLevelOptions' => self::getYearLevelOptions(),
            'courseOptions' => self::getCourseOptions(),
        ];
    }
}

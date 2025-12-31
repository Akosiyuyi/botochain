<?php

namespace App\Services;

use App\Models\SchoolUnit;
use Illuminate\Support\Collection;

class PositionEligibilityService
{
    public function resolveUnitIds(array $schoolLevels, array $yearLevels, array $courses = []): Collection
    {
        $unitIds = collect();

        foreach ($schoolLevels as $levelId) {
            $query = SchoolUnit::query()
                ->where('school_level_id', $levelId)
                ->whereIn('year_level', $yearLevels);

            if (in_array($levelId, [3, 4], true)) {
                $query->whereIn('course', $courses);
            }

            $unitIds = $unitIds->merge($query->pluck('id'));
        }

        return $unitIds->unique()->values();
    }
}

<?php

namespace App\Services;

use App\Models\Election;
use App\Models\EligibleVoter;
use App\Models\Student;

class EligibilityService
{
    public function aggregateForElection(Election $election)
    {
        foreach ($election->positions as $position) {
            $studentIds = $this->eligibleStudentsForPosition($position);

            foreach ($studentIds as $id) {
                EligibleVoter::updateOrCreate([
                    'election_id' => $election->id,
                    'position_id' => $position->id,
                    'student_id' => $id,
                ]);
            }
        }
    }

    protected function eligibleStudentsForPosition($position)
    {
        $eligibleUnits = $position->eligibleUnits()->with('schoolUnit.schoolLevel')->get();

        return Student::where('status', 'Enrolled')
            ->where(function ($query) use ($eligibleUnits) {

                foreach ($eligibleUnits as $unit) {
                    $query->orWhere(function ($q) use ($unit) {

                        $q->where('school_level', $unit->schoolUnit->schoolLevel->name)
                            ->where('year_level', $unit->schoolUnit->year_level);

                        if (!empty($unit->schoolUnit->course)) {
                            $q->where('course', $unit->schoolUnit->course);
                        }

                    });
                }
            })->pluck('id');
    }
}
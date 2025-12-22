<?php

namespace App\Services;

use Illuminate\Support\Facades\Validator;
use App\Models\SchoolLevel;
use App\Models\SchoolUnit;

class StudentValidationService
{
    public static function validate(array $data)
    {
        return Validator::make($data, [
            'student_id' => ['required', 'integer', 'min:20000000'],
            'name' => ['required', 'string', 'min:2', 'max:255'],
            
            'school_level' => [
                'required',
                function ($attribute, $value, $fail) {
                    // Check if school_level exists in DB
                    if (!SchoolLevel::where('name', $value)->exists()) {
                        $fail("Invalid school level: {$value}.");
                    }
                }
            ],

            'year_level' => [
                'required',
                function ($attribute, $value, $fail) use ($data) {
                    $schoolLevel = SchoolLevel::where('name', $data['school_level'] ?? null)->first();

                    if (!$schoolLevel) {
                        $fail('School level must be valid before checking year level.');
                        return;
                    }

                    // Check if a unit exists with this year_level (and optional course)
                    $query = SchoolUnit::where('school_level_id', $schoolLevel->id)
                        ->where('year_level', $value);

                    if (!empty($data['course'])) {
                        $query->where('course', $data['course']);
                    }

                    if (!$query->exists()) {
                        $fail("Invalid year level/course combination for {$schoolLevel->name}.");
                    }
                }
            ],

            'course' => [
                function ($attribute, $value, $fail) use ($data) {
                    $schoolLevel = SchoolLevel::where('name', $data['school_level'] ?? null)->first();

                    if (!$schoolLevel) {
                        return; // already handled in school_level validation
                    }

                    // Senior High and College must NOT be null
                    if (in_array($schoolLevel->name, ['Senior High', 'College']) && empty($value)) {
                        $fail("Course is required for {$schoolLevel->name}.");
                        return;
                    }

                    // Grade School & Junior High must be null
                    if (in_array($schoolLevel->name, ['Grade School', 'Junior High']) && !empty($value)) {
                        $fail("Course must be empty for {$schoolLevel->name}.");
                        return;
                    }

                    // If course is provided, check if it exists for the given level/year
                    if (!empty($value)) {
                        $exists = SchoolUnit::where('school_level_id', $schoolLevel->id)
                            ->where('year_level', $data['year_level'] ?? null)
                            ->where('course', $value)
                            ->exists();

                        if (!$exists) {
                            $fail("Invalid course '{$value}' for {$schoolLevel->name} {$data['year_level']}.");
                        }
                    }
                }
            ],

            'section' => ['nullable', 'string', 'max:50'],
        ]);
    }
}

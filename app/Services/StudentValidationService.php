<?php

namespace App\Services;

use Illuminate\Support\Facades\Validator;

class StudentValidationService
{
    public static function validate(array $data)
    {
        return Validator::make($data, [
            'student_id' => ['required', 'integer', 'min:20000000'],
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'school_level' => ['required', 'in:Grade School,Junior High,Senior High,College'],
            'year_level' => [
                'required',
                function ($attribute, $value, $fail) use ($data) {
                    $school_level = $data['school_level'] ?? null;

                    if ($school_level === 'Grade School' && !in_array($value, ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'])) {
                        $fail('Grade School year level must be Grade 1–6.');
                    }
                    if ($school_level === 'Junior High' && !in_array($value, ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'])) {
                        $fail('Junior High year level must be Grade 7–10.');
                    }
                    if ($school_level === 'Senior High' && !in_array($value, ['Grade 11', 'Grade 12'])) {
                        $fail('Senior High year level must be Grade 11–12.');
                    }
                    if ($school_level === 'College' && !in_array($value, ['1st Year', '2nd Year', '3rd Year', '4th Year'])) {
                        $fail('College year level must be 1st–4th Year.');
                    }
                }
            ],
            'course' => [
                function ($attribute, $value, $fail) use ($data) {
                    $school_level = $data['school_level'] ?? null;

                    // Grade School & Junior High: must be empty
                    if (in_array($school_level, ['Grade School', 'Junior High']) && !empty($value)) {
                        $fail('Course must be empty for Grade School and Junior High.');
                    }

                    // Senior High: must not be empty and must be STEM, ABM, or GAS
                    if ($school_level === 'Senior High') {
                        if (empty($value)) {
                            $fail('Course is required for Senior High.');
                        } elseif (!in_array($value, ['STEM', 'ABM', 'GAS'])) {
                            $fail('Senior High course must be STEM, ABM, or GAS.');
                        }
                    }

                    // College: must not be empty and must be BSCS, BSBA, BEED, or BSED
                    if ($school_level === 'College') {
                        if (empty($value)) {
                            $fail('Course is required for College.');
                        } elseif (!in_array($value, ['BSCS', 'BSBA', 'BEED', 'BSED'])) {
                            $fail('College course must be BSCS, BSBA, BEED, or BSED.');
                        }
                    }
                }
            ],
            'section' => ['nullable', 'string', 'max:50'],
        ]);
    }
}

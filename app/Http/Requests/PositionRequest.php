<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\SchoolUnit;

class PositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $election = $this->route('election');
        $position = $this->route('position');

        return [
            'position' => [
                'required',
                'string',
                'max:255',
                Rule::unique('positions', 'name')
                    ->where(fn($q) => $q->where('election_id', $election->id))
                    ->ignore($position?->id),
            ],

            'school_levels' => ['required', 'array', 'min:1'],
            'year_levels' => ['array'],
            'courses' => ['array'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {

            $schoolLevels = $this->input('school_levels', []);
            $yearLevels = $this->input('year_levels', []);
            $courses = $this->input('courses', []);

            foreach ($schoolLevels as $levelId) {

                // YEAR LEVELS
                $hasYear = SchoolUnit::where('school_level_id', $levelId)
                    ->whereIn('year_level', $yearLevels)
                    ->exists();

                if (!$hasYear) {
                    $validator->errors()
                        ->add("year_levels.$levelId", 'At least one year level is required.');
                }

                // COURSES (Senior High & College)
                if (in_array($levelId, [3, 4])) {
                    $hasCourse = SchoolUnit::where('school_level_id', $levelId)
                        ->whereIn('course', $courses)
                        ->exists();

                    if (!$hasCourse) {
                        $validator->errors()
                            ->add("courses.$levelId", 'At least one course is required.');
                    }
                }
            }
        });
    }
}

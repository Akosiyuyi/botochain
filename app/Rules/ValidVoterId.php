<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Models\Student;

class ValidVoterId implements ValidationRule
{
    protected $name;
    
    public function __construct($name)
    {
        $this->name = $name;
    }
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $student = Student::where('student_id', $value)->first();
        if (!$student) {
            $fail('The ID number does not exist in the student records.');
        } elseif ($student->name !== $this->name) {
            $fail('The name does not match the student record for this ID number.');
        } elseif ($student->status !== 'Enrolled') {
            $fail('The student ID is not currently enrolled.');
        }
    }
}

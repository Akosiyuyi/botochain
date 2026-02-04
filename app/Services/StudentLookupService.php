<?php

namespace App\Services;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class StudentLookupService
{
    /**
     * Find a student by user's id_number
     *
     * @param User $user
     * @return Student|null
     */
    public function findByUser(User $user): ?Student
    {
        return Student::where('student_id', $user->id_number)->first();
    }

    /**
     * Find a student by user's id_number or fail
     *
     * @param User $user
     * @return Student
     * @throws ModelNotFoundException
     */
    public function findByUserOrFail(User $user): Student
    {
        return Student::where('student_id', $user->id_number)->firstOrFail();
    }

    /**
     * Find a student by id_number
     *
     * @param string $idNumber
     * @return Student|null
     */
    public function findByIdNumber(string $idNumber): ?Student
    {
        return Student::where('student_id', $idNumber)->first();
    }

    /**
     * Find a student by id_number or fail
     *
     * @param string $idNumber
     * @return Student
     * @throws ModelNotFoundException
     */
    public function findByIdNumberOrFail(string $idNumber): Student
    {
        return Student::where('student_id', $idNumber)->firstOrFail();
    }
}

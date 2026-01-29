<?php

namespace App\Policies;

use App\Models\Election;
use App\Models\User;
use App\Models\Vote;
use App\Models\Student;

class VotePolicy
{
    public function view(User $user, Vote $vote): bool
    {
        // Only the voter who cast the vote can verify it
        if (!$user->hasRole('voter')) {
            return false;
        }
        $student= Student::where('student_id', $user->id_number)->firstOrFail();

        return $vote->student_id === $student->id;
    }

    public function eligibleVoter(User $user, Election $election): bool
    {
        // Only the voter who cast the vote can perform actions on it
        if (!$user->hasRole('voter')) {
            return false;
        }
        // Check if the user is in the election's eligible voters list
        $student = Student::where('student_id', $user->id_number)->firstOrFail();
        return $election->eligibleVoters()->contains('student_id', $student->id);
    }
}
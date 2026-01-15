<?php

namespace App\Policies;

use App\Models\Election;
use App\Models\User;
use App\Models\Vote;

class VotePolicy
{
    public function view(User $user, Vote $vote): bool
    {
        // Only the voter who cast the vote can verify it
        if (!$user->hasRole('voter')) {
            return false;
        }
        return $vote->student_id === $user->id_number;
    }

    public function eligibleVoter(User $user, Election $election): bool
    {
        // Only the voter who cast the vote can perform actions on it
        if (!$user->hasRole('voter')) {
            return false;
        }
        // Check if the user is in the election's eligible voters list
        return $election->eligibleVoters()->contains('student_id', $user->id_number);
    }
}
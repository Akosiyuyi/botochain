<?php

namespace App\Policies;

use App\Models\Election;
use App\Models\User;
use App\Models\Vote;
use App\Services\StudentLookupService;

class VotePolicy
{
    public function __construct(private StudentLookupService $studentLookupService)
    {
    }

    public function view(User $user, Vote $vote): bool
    {
        // Only the voter who cast the vote can verify it
        if (!$user->hasRole('voter')) {
            return false;
        }

        $student = $this->studentLookupService->findByUser($user);

        if (!$student) {
            return false;
        }

        return $vote->student_id === $student->id;
    }

    public function eligibleVoter(User $user, Election $election): bool
    {
        // Only the voter who cast the vote can perform actions on it
        if (!$user->hasRole('voter')) {
            return false;
        }

        // Check if the user is in the election's eligible voters list
        $student = $this->studentLookupService->findByUser($user);

        if (!$student) {
            return false;
        }

        return $election->eligibleVoters()
            ->where('student_id', $student->id)
            ->exists();
    }
}
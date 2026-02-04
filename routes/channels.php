<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Election;
use App\Services\StudentLookupService;

Broadcast::channel('election.{electionId}', function ($user, $electionId) {
    // Only authenticated users can subscribe
    if (!$user) {
        return false;
    }
    
    // Verify the election exists
    $election = Election::find($electionId);
    if (!$election) {
        return false;
    }
    
    // Allow admins to see all elections
    if ($user->hasRole(['super-admin', 'admin'])) {
        return true;
    }
    
    // For voters, check if they're eligible for this election
    if ($user->hasRole('voter')) {
        $studentLookup = app(StudentLookupService::class);
        $student = $studentLookup->findByUser($user);
        
        if (!$student) {
            return false;
        }
        
        // Check if student is eligible for at least one position in this election
        return \App\Models\EligibleVoter::where('election_id', $electionId)
            ->where('student_id', $student->id)
            ->exists();
    }
    
    return false;
});
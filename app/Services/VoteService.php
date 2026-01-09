<?php

namespace App\Services;

use App\Enums\ElectionStatus;
use App\Models\Election;
use Illuminate\Support\Facades\DB;
use App\Models\Student;
use App\Models\Vote;
use App\Models\VoteDetail;
use App\Jobs\SealVoteHash;
use Illuminate\Validation\ValidationException;

class VoteService
{
    public function create(Election $election, array $choices, Student $student): Vote
    {
        // exit if  election is not ongoing
        if ($election->status !== ElectionStatus::Ongoing) {
            throw ValidationException::withMessages([
                'election' => 'This election is not ongoing.',
            ]);
        }

        // exit if  student vote already
        if (
            Vote::where('election_id', $election->id)
                ->where('student_id', $student->id)
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'vote' => 'You have already voted.',
            ]);
        }

        // check if each position exists
        foreach ($choices as $positionId => $candidateId) {
            if (
                !$election->positions()
                    ->where('id', $positionId)
                    ->exists()
            ) {
                throw ValidationException::withMessages([
                    'vote' => 'Invalid position.',
                ]);
            }
        }


        $vote = DB::transaction(function () use ($election, $student, $choices) {

            $vote = Vote::create([
                'election_id' => $election->id,
                'student_id' => $student->id,
            ]);

            foreach ($choices as $positionId => $candidateId) {
                VoteDetail::create([
                    'vote_id' => $vote->id,
                    'position_id' => $positionId,
                    'candidate_id' => $candidateId,
                ]);
            }

            return $vote;
        });

        // Queue sealing
        SealVoteHash::dispatch($vote->id);

        return $vote;
    }
}




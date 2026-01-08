<?php

namespace App\Services;

use App\Enums\ElectionStatus;
use App\Models\Election;
use Illuminate\Support\Facades\DB;
use App\Models\Student;
use App\Models\Vote;
use App\Models\VoteDetail;

class VoteService
{
    public function create(Election $election, array $choices, Student $student): void
    {
        if ($election->status !== ElectionStatus::Ongoing) {
            throw new \Exception('This election is not ongoing.');
        }

        DB::transaction(function ($election, $student, $choices) {
            $vote = Vote::create([
                'election_id' => $election->id,
                'student_id' => $student->id,
                'payload_hash' => '',
                'previous_hash' => '',
                'current_hash' => '',
            ]);

            foreach ($choices as $positionId => $candidateId) {
                VoteDetail::create([
                    'vote_id' => $vote->id,
                    'position_id' => $positionId,
                    'candidate_id' => $candidateId,
                ]);
            }

            $payload = $vote->details()
                ->orderBy('position_id')
                ->get(['position_id', 'candidate_id'])
                ->toJson();

            $payloadHash = hash('sha256', $payload);
        });

    }
}


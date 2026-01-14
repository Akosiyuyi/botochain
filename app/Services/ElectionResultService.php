<?php

namespace App\Services;

use App\Enums\ElectionStatus;
use App\Models\Election;
use App\Models\ElectionResult;
use App\Models\VoteDetail;
use Illuminate\Support\Facades\DB;

class ElectionResultService
{
    public function computeAndStore(Election $election): void
    {
        // Hard guard
        if ($election->status !== ElectionStatus::Ended) {
            return;
        }

        // continue if status is ended
        $results = VoteDetail::query()
            ->select(
                'position_id',
                'candidate_id',
                DB::raw('COUNT(*) as vote_count')
            )
            ->whereHas(
                'vote',
                fn($q) =>
                $q->where('election_id', $election->id)
            )
            ->groupBy('position_id', 'candidate_id')
            ->get();

        foreach ($results as $row) {
            ElectionResult::updateOrCreate(
                [
                    'election_id' => $election->id,
                    'position_id' => $row->position_id,
                    'candidate_id' => $row->candidate_id,
                ],
                [
                    'vote_count' => $row->vote_count,
                ]
            );
        }
    }
}

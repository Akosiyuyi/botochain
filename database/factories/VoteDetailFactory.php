<?php

namespace Database\Factories;

use App\Models\VoteDetail;
use App\Models\Vote;
use App\Models\Position;
use App\Models\Candidate;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoteDetailFactory extends Factory
{
    protected $model = VoteDetail::class;

    public function definition(): array
    {
        return [
            // Each VoteDetail belongs to a Vote
            'vote_id' => Vote::factory(),

            // Each VoteDetail references a Position
            'position_id' => Position::factory(),

            // And the Candidate chosen for that Position
            'candidate_id' => Candidate::factory(),
        ];
    }
}

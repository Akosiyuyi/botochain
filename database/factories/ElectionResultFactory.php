<?php

namespace Database\Factories;

use App\Models\ElectionResult;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Election;
use App\Models\Position;
use App\Models\Candidate;

class ElectionResultFactory extends Factory
{
    protected $model = ElectionResult::class;

    public function definition()
    {
        return [
            'election_id' => Election::factory(),
            'position_id' => Position::factory(),
            'candidate_id' => Candidate::factory(),
            'vote_count' => $this->faker->numberBetween(0, 100),
        ];
    }
}

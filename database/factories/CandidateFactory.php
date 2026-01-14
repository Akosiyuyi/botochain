<?php

namespace Database\Factories;

use App\Models\Candidate;
use App\Models\Election;
use App\Models\Partylist;
use App\Models\Position;
use Illuminate\Database\Eloquent\Factories\Factory;

class CandidateFactory extends Factory
{
    protected $model = Candidate::class;

    public function definition(): array
    {
        return [
            // Link to an election
            'election_id' => Election::factory(),

            // Link to a partylist
            'partylist_id' => Partylist::factory(),

            // Link to a position
            'position_id' => Position::factory(),

            // Candidate name
            'name' => $this->faker->name(),

            // Candidate description (bio, slogan, etc.)
            'description' => $this->faker->sentence(10),
        ];
    }
}

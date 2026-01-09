<?php

namespace Database\Factories;

use App\Models\Partylist;
use App\Models\Election;
use Illuminate\Database\Eloquent\Factories\Factory;

class PartylistFactory extends Factory
{
    protected $model = Partylist::class;

    public function definition(): array
    {
        return [
            // Link to an election
            'election_id' => Election::factory(),

            // Partylist name
            'name' => $this->faker->company(),

            // Short description
            'description' => $this->faker->sentence(8),
        ];
    }
}

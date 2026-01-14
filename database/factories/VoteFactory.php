<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Vote;
use App\Models\Election;
use App\Models\Student;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vote>
 */
class VoteFactory extends Factory
{

    protected $model = Vote::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'election_id' => Election::factory(),
            'student_id' => Student::factory(),
            'payload_hash' => $this->faker->sha256,
            'current_hash' => $this->faker->sha256, // sealed by default 
            'previous_hash' => $this->faker->sha256, // optional chain
            'tallied' => false,
        ];
    }

    public function sealed()
    {
        return $this->state(fn() => [
            'current_hash' => $this->faker->sha256,
        ]);
    }

    public function unsealed()
    {
        return $this->state(fn() => [
            'current_hash' => null,
        ]);
    }

}

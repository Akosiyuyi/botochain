<?php

namespace Database\Factories;

use App\Models\Election;
use App\Models\Position;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EligibleVoter>
 */
class EligibleVoterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'election_id' => Election::factory(),
            'position_id' => Position::factory(),
            'student_id' => Student::factory(),
        ];
    }
}

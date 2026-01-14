<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Election;
use App\Models\Position;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Position>
 */
class PositionFactory extends Factory
{

    protected $model = Position::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'election_id' => Election::factory(),
            'name' => $this->faker->randomElement([
                'President',
                'Vice President',
                'Secretary',
                'Treasurer',
                'Auditor',
                'PRO'
            ]),
        ];
    }
}

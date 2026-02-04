<?php

namespace Database\Factories;

use App\Models\Position;
use App\Models\SchoolUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PositionEligibleUnit>
 */
class PositionEligibleUnitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'position_id' => Position::factory(),
            'school_unit_id' => SchoolUnit::factory(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\SchoolLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

class SchoolLevelFactory extends Factory
{
    protected $model = SchoolLevel::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement([
                'Grade School',
                'Junior High',
                'Senior High',
                'College',
            ]),
        ];
    }
}

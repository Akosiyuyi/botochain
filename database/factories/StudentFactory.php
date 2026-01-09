<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\SchoolUnit;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Student>
 */
class StudentFactory extends Factory
{

    protected $model = Student::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Pick a random SchoolUnit (or create one if none exist)
        $unit = SchoolUnit::inRandomOrder()->first() ?? SchoolUnit::factory()->create();

        // Get the SchoolLevel model for this unit
        $schoolLevel = $unit->schoolLevel; // assuming you defined relation in SchoolUnit model

        return [
            'student_id' => $this->faker->numberBetween(20000000, 29999999),
            'name' => $this->faker->name(),
            'school_level' => $schoolLevel->name,   // use the name instead of id
            'year_level' => $unit->year_level,
            'course' => $unit->course,
            'section' => $this->faker->optional()->word(),
            'status' => $this->faker->randomElement(['Enrolled', 'Unenrolled']),
        ];
    }

}

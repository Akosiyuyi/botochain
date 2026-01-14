<?php

namespace Database\Factories;

use App\Models\SchoolUnit;
use App\Models\SchoolLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

class SchoolUnitFactory extends Factory
{
    protected $model = SchoolUnit::class;

    public function definition()
    {
        $units = [
            ['level' => 'Grade School', 'year' => 'Grade 1', 'course' => null],
            ['level' => 'Grade School', 'year' => 'Grade 2', 'course' => null],
            ['level' => 'Junior High', 'year' => 'Grade 7', 'course' => null],
            ['level' => 'Senior High', 'year' => 'Grade 11', 'course' => 'STEM'],
            ['level' => 'Senior High', 'year' => 'Grade 12', 'course' => 'ABM'],
            ['level' => 'College', 'year' => '1st Year', 'course' => 'BSCS'],
            ['level' => 'College', 'year' => '2nd Year', 'course' => 'BSBA'],
            ['level' => 'College', 'year' => '3rd Year', 'course' => 'BSED'],
            ['level' => 'College', 'year' => '4th Year', 'course' => 'BSHM'],
        ];

        $unit = $this->faker->randomElement($units);

        // Try to find an existing SchoolLevel by name
        $schoolLevel = SchoolLevel::where('name', $unit['level'])->first();

        // If not found, create one via factory
        if (!$schoolLevel) {
            $schoolLevel = SchoolLevel::factory()->create(['name' => $unit['level']]);
        }

        return [
            'school_level_id' => $schoolLevel->id,
            'year_level' => $unit['year'],
            'course' => $unit['course'],
        ];
    }
}

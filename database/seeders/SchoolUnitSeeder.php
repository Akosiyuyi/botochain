<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SchoolUnit;
use App\Models\SchoolLevel;

class SchoolUnitSeeder extends Seeder
{
    public function run(): void
    {
        // Grade School: Grades 1–6
        $gradeSchool = SchoolLevel::where('name', 'Grade School')->first();
        $gradeSchoolUnits = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
        foreach ($gradeSchoolUnits as $unit) {
            SchoolUnit::create([
                'school_level_id' => $gradeSchool->id,
                'year_level' => $unit,
                'course' => null,
            ]);
        }

        // Junior High: Grades 7–10
        $juniorHigh = SchoolLevel::where('name', 'Junior High')->first();
        $juniorHighUnits = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
        foreach ($juniorHighUnits as $unit) {
            SchoolUnit::create([
                'school_level_id' => $juniorHigh->id,
                'year_level' => $unit,
                'course' => null,
            ]);
        }

        // Senior High: Grade 11–12 with strands
        $seniorHigh = SchoolLevel::where('name', 'Senior High')->first();
        $seniorHighUnits = [
            ['year_level' => 'Grade 11', 'course' => 'STEM'],
            ['year_level' => 'Grade 11', 'course' => 'ABM'],
            ['year_level' => 'Grade 11', 'course' => 'GAS'],
            ['year_level' => 'Grade 12', 'course' => 'STEM'],
            ['year_level' => 'Grade 12', 'course' => 'ABM'],
            ['year_level' => 'Grade 12', 'course' => 'GAS'],
        ];
        foreach ($seniorHighUnits as $unit) {
            SchoolUnit::create([
                'school_level_id' => $seniorHigh->id,
                'year_level' => $unit['year_level'],
                'course' => $unit['course'],
            ]);
        }

        // College: 1st–4th Year with courses
        $college = SchoolLevel::where('name', 'College')->first();
        $collegeUnits = [
            ['year_level' => '1st Year', 'course' => 'BSCS'],
            ['year_level' => '2nd Year', 'course' => 'BSCS'],
            ['year_level' => '3rd Year', 'course' => 'BSCS'],
            ['year_level' => '4th Year', 'course' => 'BSCS'],

            ['year_level' => '1st Year', 'course' => 'BSBA'],
            ['year_level' => '2nd Year', 'course' => 'BSBA'],
            ['year_level' => '3rd Year', 'course' => 'BSBA'],
            ['year_level' => '4th Year', 'course' => 'BSBA'],

            ['year_level' => '1st Year', 'course' => 'BSED'],
            ['year_level' => '2nd Year', 'course' => 'BSED'],
            ['year_level' => '3rd Year', 'course' => 'BSED'],
            ['year_level' => '4th Year', 'course' => 'BSED'],

            ['year_level' => '1st Year', 'course' => 'BEED'],
            ['year_level' => '2nd Year', 'course' => 'BEED'],
            ['year_level' => '3rd Year', 'course' => 'BEED'],
            ['year_level' => '4th Year', 'course' => 'BEED'],

            ['year_level' => '1st Year', 'course' => 'BSHM'],
            ['year_level' => '2nd Year', 'course' => 'BSHM'],
            ['year_level' => '3rd Year', 'course' => 'BSHM'],
            ['year_level' => '4th Year', 'course' => 'BSHM'],
        ];
        foreach ($collegeUnits as $unit) {
            SchoolUnit::create([
                'school_level_id' => $college->id,
                'year_level' => $unit['year_level'],
                'course' => $unit['course'],
            ]);
        }
    }
}

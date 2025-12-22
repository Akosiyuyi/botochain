<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SchoolLevel;

class SchoolLevelSeeder extends Seeder
{
    public function run(): void
    {
        $levels = ['Grade School', 'Junior High', 'Senior High', 'College'];

        foreach ($levels as $level) {
            SchoolLevel::create(['name' => $level]);
        }
    }
}


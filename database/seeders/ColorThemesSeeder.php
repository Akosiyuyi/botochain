<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\ColorTheme;

class ColorThemesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $colors = [
            'Red',
            'Yellow',
            'Blue',
            'Green',
            'Orange',
            'Violet',
            'Indigo',
            'Magenta',
            'Pink',
            'Gray',
        ];

        foreach ($colors as $color) {
            ColorTheme::create([
                'name' => $color,
                'image_path' => "electionThemes/default/{$color}.png",
            ]);
        }
    }
}

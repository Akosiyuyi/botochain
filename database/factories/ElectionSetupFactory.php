<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Election;
use App\Models\ElectionSetup;
use App\Models\ColorTheme;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ElectionSetup>
 */
class ElectionSetupFactory extends Factory
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
            'theme_id' => ColorTheme::inRandomOrder()->firstOrFail()->id,
            'setup_positions' => false,
            'setup_partylist' => false,
            'setup_candidates' => false,
            'setup_finalized' => false,
            'start_time' => null,
            'end_time' => null,
        ];
    }
}

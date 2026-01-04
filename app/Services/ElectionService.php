<?php

namespace App\Services;

use App\Models\Election;
use App\Models\ColorTheme;
use App\Models\Partylist;
use Illuminate\Support\Facades\DB;

class ElectionService
{
    public function create(array $data): Election
    {
        return DB::transaction(function () use ($data) {
            $election = Election::create([
                'title' => $data['title'],
                'status' => 'draft',
            ]);

            $this->syncSchoolLevels($election, $data['school_levels']);

            $theme = ColorTheme::inRandomOrder()->firstorFail();

            $election->setup()->create([
                'theme_id' => $theme->id,
                'setup_positions' => false,
                'setup_partylist' => false,
                'setup_candidates' => false,
                'setup_finalized' => false,
            ]);

            $partylist = Partylist::create([
                'election_id' => $election->id,
                'name' => "Independent",
            ]);

            $election->setup->refreshSetupFlags();
            return $election;
        });
    }

    public function update(Election $election, array $data): Election
    {
        return DB::transaction(function () use ($election, $data) {
            $election->update([
                'title' => $data['title'],
            ]);

            $this->syncSchoolLevels($election, $data['school_levels']);

            return $election;
        });
    }

    private function syncSchoolLevels(Election $election, array $schoolLevelIds): void
    {
        // Clear existing relations first
        $election->schoolLevels()->delete();

        $election->schoolLevels()->createMany(
            collect($schoolLevelIds)->map(fn($levelId) => [
                'school_level_id' => $levelId,
            ])->toArray()
        );
    }
}
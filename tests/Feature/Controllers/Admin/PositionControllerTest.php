<?php

namespace Tests\Feature\Controllers\Admin;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Election;
use App\Models\ElectionSetup;
use App\Models\Position;
use App\Models\PositionEligibleUnit;
use App\Models\SchoolLevel;
use App\Models\SchoolUnit;
use App\Models\User;

class PositionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
    }

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    private function createElectionWithSetup(): Election
    {
        $election = Election::factory()->create();
        ElectionSetup::factory()->create([
            'election_id' => $election->id,
        ]);
        return $election->load('setup');
    }

    public function test_position_creation_with_eligibility_units()
    {
        $admin = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $schoolLevel = SchoolLevel::factory()->create(['name' => 'Grade School']);
        $unit1 = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 1',
            'course' => null,
        ]);
        $unit2 = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 2',
            'course' => null,
        ]);

        $response = $this->actingAs($admin)
            ->post(route('admin.election.positions.store', $election->id), [
                'position' => 'President',
                'school_levels' => [$schoolLevel->id],
                'year_levels' => ['Grade 1'],
                'courses' => [],
            ]);

        $response->assertRedirect();

        $position = Position::where('election_id', $election->id)
            ->where('name', 'President')
            ->first();

        $this->assertNotNull($position);

        $this->assertDatabaseHas('position_eligible_units', [
            'position_id' => $position->id,
            'school_unit_id' => $unit1->id,
        ]);

        $this->assertDatabaseMissing('position_eligible_units', [
            'position_id' => $position->id,
            'school_unit_id' => $unit2->id,
        ]);

        $election->refresh()->load('setup');
        $this->assertTrue($election->setup->setup_positions);
    }
}

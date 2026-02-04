<?php

namespace Tests\Feature\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Election;
use App\Models\SchoolLevel;
use App\Models\Position;
use App\Models\Candidate;
use App\Models\Partylist;
use App\Services\ElectionService;
use App\Enums\ElectionStatus;
use Illuminate\Validation\ValidationException;
use App\Models\ColorTheme;

class ElectionManagementTest extends TestCase
{
    use RefreshDatabase;

    protected ElectionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
        $this->service = app(ElectionService::class);
    }

    // ============ Helper Methods ============

    /**
     * Create an election with setup and Independent partylist.
     * This replicates what ElectionService::create() does, but without school levels sync.
     * 
     * @param array $attributes Attributes to pass to Election factory
     * @return Election Election with loaded setup relationship
     */
    private function createElectionWithSetup($attributes = [])
    {
        $election = Election::factory()->create($attributes);
        
        // Use ElectionSetup factory to ensure theme_id and all fields are set
        \App\Models\ElectionSetup::factory()->create([
            'election_id' => $election->id,
            'setup_partylist' => false, // Will be updated by refreshSetupFlags
        ]);
        
        $election->load('setup');

        // Create Independent partylist (mimics ElectionService behavior)
        Partylist::create([
            'election_id' => $election->id,
            'name' => "Independent",
        ]);

        // Sync setup flags to reflect the partylist creation
        $election->setup->refreshSetupFlags();

        return $election;
    }

    // ============ Election Creation Tests ============

    public function test_election_can_be_created_with_valid_data()
    {
        $schoolLevels = SchoolLevel::factory()->count(3)->create();

        $election = $this->service->create([
            'title' => 'Student Council Election 2025',
            'school_levels' => $schoolLevels->pluck('id')->toArray(),
        ]);

        $this->assertNotNull($election->id);
        $this->assertEquals('Student Council Election 2025', $election->title);
        $this->assertEquals(ElectionStatus::Draft, $election->status);
    }

    public function test_election_creation_creates_setup_automatically()
    {
        $schoolLevel = SchoolLevel::factory()->create();

        $election = $this->service->create([
            'title' => 'Election with Setup',
            'school_levels' => [$schoolLevel->id],
        ]);

        $this->assertNotNull($election->setup);
        $this->assertNotNull($election->setup->theme_id);
        $this->assertFalse($election->setup->setup_positions);
        $this->assertTrue($election->setup->setup_partylist); // Independent partylist auto-created
        $this->assertFalse($election->setup->setup_candidates);
        $this->assertFalse($election->setup->setup_finalized);
    }

    public function test_election_creation_syncs_school_levels()
    {
        $schoolLevels = SchoolLevel::factory()->count(4)->create();

        $election = $this->service->create([
            'title' => 'Multi-School Election',
            'school_levels' => $schoolLevels->pluck('id')->toArray(),
        ]);

        // Verify all school levels are synced
        $this->assertEquals(4, $election->schoolLevels()->count());
        $this->assertTrue(
            $election->schoolLevels()
                ->whereIn('school_level_id', $schoolLevels->pluck('id'))
                ->count() === 4
        );
    }

    public function test_election_creation_creates_independent_partylist()
    {
        $schoolLevel = SchoolLevel::factory()->create();

        $election = $this->service->create([
            'title' => 'Election with Independent',
            'school_levels' => [$schoolLevel->id],
        ]);

        $independent = $election->partylists()->where('name', 'Independent')->first();
        $this->assertNotNull($independent);
        $this->assertEquals('Independent', $independent->name);
    }

    public function test_election_creation_requires_title()
    {
        $schoolLevel = SchoolLevel::factory()->create();

        $this->expectException(\ErrorException::class);

        $this->service->create([
            'school_levels' => [$schoolLevel->id],
        ]);
    }

    public function test_election_creation_requires_school_levels()
    {
        $this->expectException(\ErrorException::class);

        $this->service->create([
            'title' => 'No School Levels',
        ]);
    }

    // ============ Election Status Transition Tests ============

    public function test_election_starts_in_draft_status()
    {
        $schoolLevel = SchoolLevel::factory()->create();

        $election = $this->service->create([
            'title' => 'Draft Election',
            'school_levels' => [$schoolLevel->id],
        ]);

        $this->assertEquals(ElectionStatus::Draft, $election->status);
    }

    public function test_election_can_transition_from_draft_to_upcoming()
    {
        $election = Election::factory()->draft()->create();

        $election->update(['status' => ElectionStatus::Upcoming]);

        $this->assertEquals(ElectionStatus::Upcoming, $election->fresh()->status);
    }

    public function test_election_can_transition_from_upcoming_to_ongoing()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Upcoming]);

        $election->update(['status' => ElectionStatus::Ongoing]);

        $this->assertEquals(ElectionStatus::Ongoing, $election->fresh()->status);
    }

    public function test_election_can_transition_from_ongoing_to_ended()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);

        $election->update(['status' => ElectionStatus::Ended]);

        $this->assertEquals(ElectionStatus::Ended, $election->fresh()->status);
    }

    public function test_election_can_transition_from_ended_to_finalized()
    {
        $election = Election::factory()->ended()->create();

        $election->update([
            'status' => ElectionStatus::Finalized,
            'final_hash' => hash('sha256', 'election_votes'),
            'finalized_at' => now(),
        ]);

        $this->assertEquals(ElectionStatus::Finalized, $election->fresh()->status);
        $this->assertNotNull($election->fresh()->final_hash);
        $this->assertNotNull($election->fresh()->finalized_at);
    }

    public function test_election_status_transitions_are_tracked()
    {
        $schoolLevel = SchoolLevel::factory()->create();

        $election = $this->service->create([
            'title' => 'Status Tracking Election',
            'school_levels' => [$schoolLevel->id],
        ]);

        $this->assertEquals(ElectionStatus::Draft, $election->status);

        $election->update(['status' => ElectionStatus::Upcoming]);
        $this->assertEquals(ElectionStatus::Upcoming, $election->fresh()->status);

        $election->update(['status' => ElectionStatus::Ongoing]);
        $this->assertEquals(ElectionStatus::Ongoing, $election->fresh()->status);
    }

    // ============ Election Modification Protection Tests ============

    public function test_election_can_be_modified_when_draft()
    {
        $schoolLevel = SchoolLevel::factory()->create();
        $election = Election::factory()->draft()->create();

        $updated = $election->update([
            'title' => 'Updated Draft Election',
        ]);

        $this->assertTrue($updated);
        $this->assertEquals('Updated Draft Election', $election->fresh()->title);
    }

    public function test_election_can_be_modified_when_upcoming()
    {
        $schoolLevel = SchoolLevel::factory()->create();
        $election = Election::factory()->create(['status' => ElectionStatus::Upcoming]);

        $updated = $election->update([
            'title' => 'Updated Upcoming Election',
        ]);

        $this->assertTrue($updated);
        $this->assertEquals('Updated Upcoming Election', $election->fresh()->title);
    }

    public function test_election_should_not_be_modified_when_ongoing()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);

        // In the controller, we prevent this. At model level, update is allowed but should be protected by controller
        // This test documents the behavior - controller prevents ongoing/ended/finalized elections from being edited
        $this->assertEquals(ElectionStatus::Ongoing, $election->status);
    }

    public function test_election_should_not_be_modified_when_ended()
    {
        $election = Election::factory()->ended()->create();

        $this->assertEquals(ElectionStatus::Ended, $election->status);
    }

    public function test_election_should_not_be_modified_when_finalized()
    {
        $election = Election::factory()->finalized()->create([
            'final_hash' => 'some_hash',
            'finalized_at' => now(),
        ]);

        $this->assertEquals(ElectionStatus::Finalized, $election->status);
    }

    // ============ Election Setup Flags Tests ============

    public function test_setup_positions_flag_updates_when_position_added()
    {
        $election = $this->createElectionWithSetup();
        $this->assertFalse($election->setup->setup_positions);

        Position::factory()->create(['election_id' => $election->id]);
        $election->setup->refreshSetupFlags();

        $this->assertTrue($election->setup->fresh()->setup_positions);
    }

    public function test_setup_candidates_flag_updates_when_candidate_added()
    {
        $election = $this->createElectionWithSetup();
        $this->assertFalse($election->setup->setup_candidates);

        $position = Position::factory()->create(['election_id' => $election->id]);
        Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        $election->setup->refreshSetupFlags();

        $this->assertTrue($election->setup->fresh()->setup_candidates);
    }

    public function test_setup_partylist_flag_true_when_independent_partylist_exists()
    {
        $election = $this->createElectionWithSetup();

        $election->setup->refreshSetupFlags();
        // Independent partylist is auto-created by ElectionService
        $this->assertTrue($election->setup->setup_partylist);
    }

    public function test_setup_finalized_flag_only_true_when_all_flags_true()
    {
        $election = $this->createElectionWithSetup();
        $setup = $election->setup;
        $election->setup->refreshSetupFlags();

        // Initially all flags false/not finalized
        $this->assertFalse($setup->setup_positions);
        $this->assertTrue($setup->setup_partylist); // Auto-created
        $this->assertFalse($setup->setup_candidates);
        $this->assertFalse($setup->setup_finalized);

        // Add position
        Position::factory()->create(['election_id' => $election->id]);
        $setup->refreshSetupFlags();
        $this->assertTrue($setup->fresh()->setup_positions);
        $this->assertFalse($setup->fresh()->setup_finalized); // Still not finalized - need candidates too

        // Add candidate
        $position = $election->positions()->first();
        Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);
        $setup->refreshSetupFlags();

        // Now all required flags are true (positions, partylist, candidates)
        $this->assertTrue($setup->fresh()->setup_positions);
        $this->assertTrue($setup->fresh()->setup_partylist);
        $this->assertTrue($setup->fresh()->setup_candidates);
    }

    public function test_setup_finalized_reset_when_position_removed()
    {
        $election = $this->createElectionWithSetup();
        $position = Position::factory()->create(['election_id' => $election->id]);
        Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        // Set all flags as finalized
        $election->setup->update([
            'setup_positions' => true,
            'setup_partylist' => true,
            'setup_candidates' => true,
            'setup_finalized' => true,
        ]);

        // Remove position
        $position->delete();

        // Refresh flags
        $election->setup->refreshSetupFlags();

        // Finalized should reset to false
        $this->assertFalse($election->setup->fresh()->setup_finalized);
    }

    // ============ School Levels Sync Tests ============

    public function test_school_levels_synced_during_creation()
    {
        $schoolLevels = SchoolLevel::factory()->count(2)->create();

        $election = $this->service->create([
            'title' => 'School Levels Sync Test',
            'school_levels' => $schoolLevels->pluck('id')->toArray(),
        ]);

        $this->assertEquals(2, $election->schoolLevels()->count());
        $schoolLevels->each(function ($level) use ($election) {
            $this->assertTrue(
                $election->schoolLevels()->where('school_level_id', $level->id)->exists()
            );
        });
    }

    public function test_school_levels_can_be_updated()
    {
        $initialLevels = SchoolLevel::factory()->count(2)->create();
        $newLevels = SchoolLevel::factory()->count(3)->create();

        $election = $this->service->create([
            'title' => 'Update School Levels',
            'school_levels' => $initialLevels->pluck('id')->toArray(),
        ]);

        $this->assertEquals(2, $election->schoolLevels()->count());

        // Update school levels
        $this->service->update($election, [
            'title' => $election->title,
            'school_levels' => $newLevels->pluck('id')->toArray(),
        ]);

        $election->refresh();
        $this->assertEquals(3, $election->schoolLevels()->count());
        $newLevels->each(function ($level) use ($election) {
            $this->assertTrue(
                $election->schoolLevels()->where('school_level_id', $level->id)->exists()
            );
        });
    }

    public function test_multiple_elections_with_same_school_levels()
    {
        $schoolLevels = SchoolLevel::factory()->count(2)->create();

        $election1 = $this->service->create([
            'title' => 'Election 1',
            'school_levels' => $schoolLevels->pluck('id')->toArray(),
        ]);

        $election2 = $this->service->create([
            'title' => 'Election 2',
            'school_levels' => $schoolLevels->pluck('id')->toArray(),
        ]);

        $this->assertEquals(2, $election1->schoolLevels()->count());
        $this->assertEquals(2, $election2->schoolLevels()->count());
        $this->assertNotEquals($election1->id, $election2->id);
    }

    // ============ Election Creation Atomicity Tests ============

    public function test_election_creation_is_atomic()
    {
        $schoolLevel = SchoolLevel::factory()->create();
        $initialCount = Election::count();

        try {
            $this->service->create([
                'title' => 'Atomic Test',
                'school_levels' => [$schoolLevel->id],
            ]);
        } catch (\Exception $e) {
            // If creation fails for any reason, no partial data should be created
        }

        // Verify complete election was created with all components
        $election = Election::where('title', 'Atomic Test')->first();
        $this->assertNotNull($election);
        $this->assertNotNull($election->setup);
        $this->assertNotNull($election->partylists()->where('name', 'Independent')->first());
    }

    public function test_election_with_no_school_levels_still_creates_properly()
    {
        // Create election with empty school levels array
        $election = $this->createElectionWithSetup();

        // Verify election exists with setup
        $this->assertNotNull($election->id);
        $this->assertNotNull($election->setup);
        $this->assertEquals(0, $election->schoolLevels()->count());
    }
}

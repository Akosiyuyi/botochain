<?php

namespace Tests\Feature\Controllers\Admin;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Election;
use App\Models\ElectionSetup;
use App\Models\Position;
use App\Models\Candidate;
use App\Models\Partylist;
use App\Models\User;
use App\Enums\ElectionStatus;
use Carbon\Carbon;

class ElectionSetupControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Election $election;
    private ElectionSetup $setup;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
        
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        
        $this->election = Election::factory()->create([
            'status' => ElectionStatus::Draft,
        ]);
        
        $this->setup = ElectionSetup::factory()->create([
            'election_id' => $this->election->id,
        ]);
        
        // Refresh relationship
        $this->election->load('setup');
    }

    /**
     * Test that setup_positions flag is toggled when positions are added
     */
    public function test_setup_positions_flag_toggled_when_position_added()
    {
        // Initially no positions, flag should be false
        $this->assertFalse($this->setup->fresh()->setup_positions);
        
        // Add a position
        Position::factory()->create(['election_id' => $this->election->id]);
        
        // Refresh flags
        $this->setup->refreshSetupFlags();
        
        // Flag should now be true
        $this->assertTrue($this->setup->fresh()->setup_positions);
    }

    /**
     * Test that setup_positions flag is toggled back when all positions are deleted
     */
    public function test_setup_positions_flag_toggled_back_when_positions_deleted()
    {
        // Add position to set flag to true
        $position = Position::factory()->create(['election_id' => $this->election->id]);
        $this->setup->refreshSetupFlags();
        $this->assertTrue($this->setup->fresh()->setup_positions);
        
        // Delete the position
        $position->delete();
        
        // Refresh flags
        $this->setup->refreshSetupFlags();
        
        // Flag should be false again
        $this->assertFalse($this->setup->fresh()->setup_positions);
    }

    /**
     * Test that setup_candidates flag is toggled when candidates are added
     */
    public function test_setup_candidates_flag_toggled_when_candidate_added()
    {
        // Initially no candidates, flag should be false
        $this->assertFalse($this->setup->fresh()->setup_candidates);
        
        // Create position and partylist first (required for candidate)
        $position = Position::factory()->create(['election_id' => $this->election->id]);
        $partylist = Partylist::factory()->create(['election_id' => $this->election->id]);
        
        // Add a candidate
        Candidate::factory()->create([
            'election_id' => $this->election->id,
            'position_id' => $position->id,
            'partylist_id' => $partylist->id,
        ]);
        
        // Refresh flags
        $this->setup->refreshSetupFlags();
        
        // Flag should now be true
        $this->assertTrue($this->setup->fresh()->setup_candidates);
    }

    /**
     * Test that setup_candidates flag is toggled back when all candidates are deleted
     */
    public function test_setup_candidates_flag_toggled_back_when_candidates_deleted()
    {
        // Setup with candidate
        $position = Position::factory()->create(['election_id' => $this->election->id]);
        $partylist = Partylist::factory()->create(['election_id' => $this->election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $this->election->id,
            'position_id' => $position->id,
            'partylist_id' => $partylist->id,
        ]);
        
        $this->setup->refreshSetupFlags();
        $this->assertTrue($this->setup->fresh()->setup_candidates);
        
        // Delete the candidate
        $candidate->delete();
        
        // Refresh flags
        $this->setup->refreshSetupFlags();
        
        // Flag should be false again
        $this->assertFalse($this->setup->fresh()->setup_candidates);
    }

    /**
     * Test that canFinalize returns false when requirements are not met
     */
    public function test_setup_cannot_proceed_without_positions()
    {
        // No positions created, should not be able to finalize
        $this->assertFalse($this->setup->canFinalize());
    }

    /**
     * Test that canFinalize returns false when candidates are missing
     */
    public function test_setup_cannot_proceed_without_candidates()
    {
        // Create position but no candidate
        Position::factory()->create(['election_id' => $this->election->id]);
        $this->setup->refreshSetupFlags();
        
        // Should still not be able to finalize
        $this->assertFalse($this->setup->canFinalize());
    }

    /**
     * Test that canFinalize returns false when schedule is missing
     */
    public function test_setup_cannot_proceed_without_schedule()
    {
        // Create complete setup but no schedule
        $position = Position::factory()->create(['election_id' => $this->election->id]);
        $partylist = Partylist::factory()->create(['election_id' => $this->election->id]);
        Candidate::factory()->create([
            'election_id' => $this->election->id,
            'position_id' => $position->id,
            'partylist_id' => $partylist->id,
        ]);
        
        $this->setup->refreshSetupFlags();
        
        // All flags true but no schedule
        $this->assertTrue($this->setup->fresh()->setup_positions);
        $this->assertTrue($this->setup->fresh()->setup_candidates);
        $this->assertNull($this->setup->fresh()->start_time);
        $this->assertNull($this->setup->fresh()->end_time);
        
        // Should not be able to finalize
        $this->assertFalse($this->setup->canFinalize());
    }

    /**
     * Test that canFinalize returns true when all requirements are met
     */
    public function test_setup_can_proceed_when_all_requirements_met()
    {
        // Create complete setup
        $position = Position::factory()->create(['election_id' => $this->election->id]);
        $partylist = Partylist::factory()->create(['election_id' => $this->election->id]);
        Candidate::factory()->create([
            'election_id' => $this->election->id,
            'position_id' => $position->id,
            'partylist_id' => $partylist->id,
        ]);
        
        // Set schedule
        $this->setup->update([
            'start_time' => now()->addDay(),
            'end_time' => now()->addDay()->addHours(2),
        ]);
        
        $this->setup->refreshSetupFlags();
        
        // Should be able to finalize
        $this->assertTrue($this->setup->canFinalize());
    }

    /**
     * Test that schedule update fails when start date is in the past
     */
    public function test_schedule_update_fails_when_start_date_in_past()
    {
        $response = $this->actingAs($this->admin)
            ->patch(route('admin.election.setup.update', [$this->election->id, $this->setup->id]), [
                'start_date' => now()->subDay()->format('Y-m-d'),
                'start_time' => '10:00',
                'end_time' => '12:00',
            ]);

        $response->assertSessionHasErrors('start_date');
    }

    /**
     * Test that schedule update fails when start time is in the past
     */
    public function test_schedule_update_fails_when_start_time_in_past()
    {
        $response = $this->actingAs($this->admin)
            ->patch(route('admin.election.setup.update', [$this->election->id, $this->setup->id]), [
                'start_date' => now()->format('Y-m-d'),
                'start_time' => now()->subHour()->format('H:i'),
                'end_time' => now()->addHour()->format('H:i'),
            ]);

        $response->assertSessionHasErrors('start_time');
    }

    /**
     * Test that schedule update fails when end time is before start time
     */
    public function test_schedule_update_fails_when_end_before_start()
    {
        $response = $this->actingAs($this->admin)
            ->patch(route('admin.election.setup.update', [$this->election->id, $this->setup->id]), [
                'start_date' => now()->addDay()->format('Y-m-d'),
                'start_time' => '14:00',
                'end_time' => '10:00', // Before start time
            ]);

        $response->assertSessionHasErrors('end_time');
    }

    /**
     * Test that schedule update succeeds with valid data
     */
    public function test_schedule_update_succeeds_with_valid_data()
    {
        $startDate = now()->addDay()->format('Y-m-d');
        $startTime = '10:00';
        $endTime = '14:00';

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.election.setup.update', [$this->election->id, $this->setup->id]), [
                'start_date' => $startDate,
                'start_time' => $startTime,
                'end_time' => $endTime,
            ]);

        $response->assertRedirect(route('admin.election.show', $this->election->id));
        $response->assertSessionHas('success', 'Election schedule updated.');

        // Verify database
        $this->setup->refresh();
        $this->assertNotNull($this->setup->start_time);
        $this->assertNotNull($this->setup->end_time);
        
        // Verify the times match
        $expectedStart = Carbon::createFromFormat('Y-m-d H:i', "$startDate $startTime", config('app.timezone'));
        $expectedEnd = Carbon::createFromFormat('Y-m-d H:i', "$startDate $endTime", config('app.timezone'));
        
        $this->assertTrue($this->setup->start_time->equalTo($expectedStart));
        $this->assertTrue($this->setup->end_time->equalTo($expectedEnd));
    }

    /**
     * Test that setup_finalized flag resets when a required flag becomes false
     */
    public function test_setup_finalized_resets_when_requirement_removed()
    {
        // Create complete setup
        $position = Position::factory()->create(['election_id' => $this->election->id]);
        $partylist = Partylist::factory()->create(['election_id' => $this->election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $this->election->id,
            'position_id' => $position->id,
            'partylist_id' => $partylist->id,
        ]);
        
        $this->setup->refreshSetupFlags();
        
        // Manually set finalized flag to true
        $this->setup->update(['setup_finalized' => true]);
        $this->assertTrue($this->setup->fresh()->setup_finalized);
        
        // Delete candidate (makes setup_candidates flag false)
        $candidate->delete();
        $this->setup->refreshSetupFlags();
        
        // Finalized flag should now be false
        $this->assertFalse($this->setup->fresh()->setup_finalized);
    }
}

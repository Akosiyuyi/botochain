<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Election;
use App\Models\Partylist;
use App\Models\User;
use App\Models\SchoolLevel;
use App\Services\ElectionService;

class PartylistManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
        $this->artisan('db:seed', ['--class' => 'SchoolLevelSeeder']);
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
        $election->setup()->create([
            'setup_positions' => false,
            'setup_partylist' => false,
            'setup_candidates' => false,
            'setup_finalized' => false,
        ]);
        return $election;
    }

    /**
     * Test partylist can be created
     */
    public function test_partylist_can_be_created()
    {
        $admin = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $response = $this->actingAs($admin)
            ->post(route('admin.election.partylists.store', $election->id), [
                'name' => 'Team Progressive',
                'description' => 'A progressive political party',
            ]);

        $response->assertRedirect(route('admin.election.show', $election->id));

        $this->assertDatabaseHas('partylists', [
            'election_id' => $election->id,
            'name' => 'Team Progressive',
            'description' => 'A progressive political party',
        ]);
    }

    /**
     * Test partylist names must be unique per election
     */
    public function test_partylist_must_be_unique_per_election()
    {
        $admin = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        // Create first partylist
        Partylist::factory()->create([
            'election_id' => $election->id,
            'name' => 'Team Progressive',
        ]);

        // Try to create duplicate partylist in same election
        $response = $this->actingAs($admin)
            ->post(route('admin.election.partylists.store', $election->id), [
                'name' => 'Team Progressive',
                'description' => 'Duplicate attempt',
            ]);

        $response->assertSessionHasErrors(['name']);
    }

    /**
     * Test partylist can have same name in different elections
     */
    public function test_partylist_can_have_same_name_in_different_elections()
    {
        $admin = $this->createAdminUser();
        $election1 = $this->createElectionWithSetup();
        $election2 = $this->createElectionWithSetup();

        Partylist::factory()->create([
            'election_id' => $election1->id,
            'name' => 'Team Progressive',
        ]);

        $response = $this->actingAs($admin)
            ->post(route('admin.election.partylists.store', $election2->id), [
                'name' => 'Team Progressive',
                'description' => 'Same name in different election',
            ]);

        $response->assertRedirect(route('admin.election.show', $election2->id));

        $this->assertDatabaseHas('partylists', [
            'election_id' => $election2->id,
            'name' => 'Team Progressive',
        ]);
    }

    /**
     * Test partylist creation requires name
     */
    public function test_partylist_creation_requires_name()
    {
        $admin = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $response = $this->actingAs($admin)
            ->post(route('admin.election.partylists.store', $election->id), [
                'name' => '',
                'description' => 'Missing name',
            ]);

        $response->assertSessionHasErrors(['name']);
    }

    /**
     * Test partylist name cannot exceed max length
     */
    public function test_partylist_name_cannot_exceed_max_length()
    {
        $admin = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $response = $this->actingAs($admin)
            ->post(route('admin.election.partylists.store', $election->id), [
                'name' => str_repeat('A', 256), // Exceeds 255 character limit
                'description' => 'Name too long',
            ]);

        $response->assertSessionHasErrors(['name']);
    }

    /**
     * Test partylist description is optional
     */
    public function test_partylist_description_is_optional()
    {
        $admin = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $response = $this->actingAs($admin)
            ->post(route('admin.election.partylists.store', $election->id), [
                'name' => 'Team Progressive',
            ]);

        $response->assertRedirect(route('admin.election.show', $election->id));

        $this->assertDatabaseHas('partylists', [
            'election_id' => $election->id,
            'name' => 'Team Progressive',
            'description' => null,
        ]);
    }

    /**
     * Test partylist can be updated
     */
    public function test_partylist_can_be_updated()
    {
        $admin = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        $partylist = Partylist::factory()->create([
            'election_id' => $election->id,
            'name' => 'Team Progressive',
        ]);

        $response = $this->actingAs($admin)
            ->patch(route('admin.election.partylists.update', [$election->id, $partylist->id]), [
                'name' => 'Team Conservative',
                'description' => 'Updated description',
            ]);

        $response->assertRedirect(route('admin.election.show', $election->id));

        $this->assertDatabaseHas('partylists', [
            'id' => $partylist->id,
            'name' => 'Team Conservative',
            'description' => 'Updated description',
        ]);
    }

    /**
     * Test partylist can be deleted
     */
    public function test_partylist_can_be_deleted()
    {
        $admin = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        $partylist = Partylist::factory()->create([
            'election_id' => $election->id,
            'name' => 'Team Progressive',
        ]);

        $response = $this->actingAs($admin)
            ->delete(route('admin.election.partylists.destroy', [$election->id, $partylist->id]));

        $response->assertRedirect(route('admin.election.show', $election->id));

        $this->assertDatabaseMissing('partylists', [
            'id' => $partylist->id,
        ]);
    }

    /**
     * Test independent partylist auto-created on election creation
     */
    public function test_independent_partylist_auto_created_on_election_creation()
    {
        $electionService = app(ElectionService::class);
        $schoolLevel = SchoolLevel::first();

        $election = $electionService->create([
            'title' => 'Student Body Election 2025',
            'school_levels' => [$schoolLevel->id],
        ]);

        $independent = $election->partylists()->where('name', 'Independent')->first();

        $this->assertNotNull($independent);
        $this->assertEquals('Independent', $independent->name);
        $this->assertNull($independent->description);
    }

    /**
     * Test independent partylist exists for all elections
     */
    public function test_independent_partylist_exists_for_all_elections()
    {
        $electionService = app(ElectionService::class);
        $schoolLevels = SchoolLevel::limit(2)->get();

        $election1 = $electionService->create([
            'title' => 'Election 1',
            'school_levels' => [$schoolLevels[0]->id],
        ]);

        $election2 = $electionService->create([
            'title' => 'Election 2',
            'school_levels' => [$schoolLevels[1]->id],
        ]);

        $independent1 = $election1->partylists()->where('name', 'Independent')->first();
        $independent2 = $election2->partylists()->where('name', 'Independent')->first();

        $this->assertNotNull($independent1);
        $this->assertNotNull($independent2);
        $this->assertNotEquals($independent1->id, $independent2->id);
    }

    /**
     * Test only authenticated admin can create partylist
     */
    public function test_only_authenticated_admin_can_create_partylist()
    {
        $election = $this->createElectionWithSetup();

        $response = $this->post(route('admin.election.partylists.store', $election->id), [
            'name' => 'Team Progressive',
        ]);

        $response->assertRedirect(route('login'));
    }

    /**
     * Test partylist creation refreshes setup flags
     */
    public function test_partylist_creation_refreshes_setup_flags()
    {
        $admin = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        // Create a partylist
        $this->actingAs($admin)
            ->post(route('admin.election.partylists.store', $election->id), [
                'name' => 'Team Progressive',
            ]);

        // Refresh and check if setup_partylist flag is updated
        $election->refresh();
        $this->assertTrue($election->setup->setup_partylist);
    }

    /**
     * Test partylist deletion refreshes setup flags
     */
    public function test_partylist_deletion_refreshes_setup_flags()
    {
        $admin = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        // Create partylist via store endpoint so setup flags are refreshed properly
        $this->actingAs($admin)
            ->post(route('admin.election.partylists.store', $election->id), [
                'name' => 'Team Progressive',
            ]);

        $election->refresh();
        $this->assertTrue($election->setup->setup_partylist);

        // Get the partylist that was just created
        $partylist = $election->partylists()->where('name', 'Team Progressive')->first();

        // Delete it
        $this->actingAs($admin)
            ->delete(route('admin.election.partylists.destroy', [$election->id, $partylist->id]));

        // Now only Independent remains (or none if no partylists)
        $election->refresh();
        $this->assertFalse($election->setup->setup_partylist);
    }

    /**
     * Test partylist update maintains unique constraint
     */
    public function test_partylist_update_maintains_unique_constraint()
    {
        $admin = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $partylist1 = Partylist::factory()->create([
            'election_id' => $election->id,
            'name' => 'Team Progressive',
        ]);

        $partylist2 = Partylist::factory()->create([
            'election_id' => $election->id,
            'name' => 'Team Conservative',
        ]);

        // Try to rename partylist2 to partylist1's name
        $response = $this->actingAs($admin)
            ->patch(route('admin.election.partylists.update', [$election->id, $partylist2->id]), [
                'name' => 'Team Progressive',
            ]);

        $response->assertSessionHasErrors(['name']);
    }

    /**
     * Test partylist update allows same name on self
     */
    public function test_partylist_update_allows_same_name_on_self()
    {
        $admin = $this->createAdminUser();
        $election = $this->createElectionWithSetup();

        $partylist = Partylist::factory()->create([
            'election_id' => $election->id,
            'name' => 'Team Progressive',
        ]);

        $response = $this->actingAs($admin)
            ->patch(route('admin.election.partylists.update', [$election->id, $partylist->id]), [
                'name' => 'Team Progressive',
                'description' => 'Updated description',
            ]);

        $response->assertRedirect(route('admin.election.show', $election->id));

        $this->assertDatabaseHas('partylists', [
            'id' => $partylist->id,
            'name' => 'Team Progressive',
            'description' => 'Updated description',
        ]);
    }
}

<?php

namespace Tests\Feature\Controllers\Admin;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Partylist;
use App\Models\Position;
use App\Models\User;
use App\Enums\ElectionStatus;

class CandidateControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles for admin authentication
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
    }

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    private function createElectionWithSetup(array $attributes = []): Election
    {
        $election = Election::factory()->create(array_merge([
            'status' => ElectionStatus::Draft,
        ], $attributes));

        // Ensure ElectionSetup exists
        if (!$election->setup) {
            \App\Models\ElectionSetup::factory()->create([
                'election_id' => $election->id,
            ]);
        }

        return $election;
    }

    public function test_candidate_can_be_created()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $partylist = Partylist::factory()->create(['election_id' => $election->id]);
        $position = Position::factory()->create(['election_id' => $election->id]);

        $response = $this->actingAs($user)
            ->post(route('admin.election.candidates.store', $election->id), [
                'partylist' => $partylist->id,
                'position' => $position->id,
                'name' => 'John Doe',
                'description' => 'A great candidate',
            ]);

        $response->assertRedirect(route('admin.election.show', $election->id));
        $response->assertSessionHas('success', 'Candidate John Doe added.');

        $this->assertDatabaseHas('candidates', [
            'election_id' => $election->id,
            'partylist_id' => $partylist->id,
            'position_id' => $position->id,
            'name' => 'John Doe',
            'description' => 'A great candidate',
        ]);
    }

    public function test_candidate_unique_per_election()
    {
        $user = $this->createAdminUser();
        $election1 = $this->createElectionWithSetup();
        $election2 = $this->createElectionWithSetup();
        
        // Create candidate in election 1
        $partylist1 = Partylist::factory()->create(['election_id' => $election1->id]);
        $position1 = Position::factory()->create(['election_id' => $election1->id]);
        
        Candidate::create([
            'election_id' => $election1->id,
            'partylist_id' => $partylist1->id,
            'position_id' => $position1->id,
            'name' => 'John Doe',
            'description' => 'Candidate 1',
        ]);

        // Try to create candidate with same name in election 2 - should succeed (different election)
        $partylist2 = Partylist::factory()->create(['election_id' => $election2->id]);
        $position2 = Position::factory()->create(['election_id' => $election2->id]);
        
        $response = $this->actingAs($user)
            ->post(route('admin.election.candidates.store', $election2->id), [
                'partylist' => $partylist2->id,
                'position' => $position2->id,
                'name' => 'John Doe',
                'description' => 'Candidate 2',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // But duplicate in same election should fail
        $partylist1_2 = Partylist::factory()->create(['election_id' => $election1->id]);
        $position1_2 = Position::factory()->create(['election_id' => $election1->id]);
        
        $response = $this->actingAs($user)
            ->post(route('admin.election.candidates.store', $election1->id), [
                'partylist' => $partylist1_2->id,
                'position' => $position1_2->id,
                'name' => 'John Doe',
                'description' => 'Duplicate',
            ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_candidate_must_belong_to_valid_position()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $partylist = Partylist::factory()->create(['election_id' => $election->id]);
        // Create position in different election
        $otherElection = $this->createElectionWithSetup();
        $positionOtherElection = Position::factory()->create(['election_id' => $otherElection->id]);

        $response = $this->actingAs($user)
            ->post(route('admin.election.candidates.store', $election->id), [
                'partylist' => $partylist->id,
                'position' => $positionOtherElection->id, // Position from different election
                'name' => 'Jane Smith',
                'description' => 'Invalid position',
            ]);

        $response->assertSessionHasErrors('position');
        $this->assertDatabaseMissing('candidates', [
            'name' => 'Jane Smith',
        ]);
    }

    public function test_invalid_position_rejected()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $partylist = Partylist::factory()->create(['election_id' => $election->id]);

        $response = $this->actingAs($user)
            ->post(route('admin.election.candidates.store', $election->id), [
                'partylist' => $partylist->id,
                'position' => 999, // Non-existent position
                'name' => 'Bob Johnson',
                'description' => 'Invalid position ID',
            ]);

        $response->assertSessionHasErrors('position');
        $this->assertDatabaseMissing('candidates', [
            'name' => 'Bob Johnson',
        ]);
    }

    public function test_candidate_requires_valid_partylist()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $position = Position::factory()->create(['election_id' => $election->id]);
        // Create partylist in different election
        $otherElection = $this->createElectionWithSetup();
        $partylistOther = Partylist::factory()->create(['election_id' => $otherElection->id]);

        $response = $this->actingAs($user)
            ->post(route('admin.election.candidates.store', $election->id), [
                'partylist' => $partylistOther->id, // Partylist from different election
                'position' => $position->id,
                'name' => 'Alice Wonder',
                'description' => 'Invalid partylist',
            ]);

        $response->assertSessionHasErrors('partylist');
        $this->assertDatabaseMissing('candidates', [
            'name' => 'Alice Wonder',
        ]);
    }

    public function test_invalid_partylist_rejected()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $position = Position::factory()->create(['election_id' => $election->id]);

        $response = $this->actingAs($user)
            ->post(route('admin.election.candidates.store', $election->id), [
                'partylist' => 999, // Non-existent partylist
                'position' => $position->id,
                'name' => 'Charlie Brown',
                'description' => 'Invalid partylist ID',
            ]);

        $response->assertSessionHasErrors('partylist');
        $this->assertDatabaseMissing('candidates', [
            'name' => 'Charlie Brown',
        ]);
    }

    public function test_candidate_name_is_required()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $partylist = Partylist::factory()->create(['election_id' => $election->id]);
        $position = Position::factory()->create(['election_id' => $election->id]);

        $response = $this->actingAs($user)
            ->post(route('admin.election.candidates.store', $election->id), [
                'partylist' => $partylist->id,
                'position' => $position->id,
                'name' => '', // Empty name
                'description' => 'No name provided',
            ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_candidate_name_cannot_exceed_max_length()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $partylist = Partylist::factory()->create(['election_id' => $election->id]);
        $position = Position::factory()->create(['election_id' => $election->id]);

        $response = $this->actingAs($user)
            ->post(route('admin.election.candidates.store', $election->id), [
                'partylist' => $partylist->id,
                'position' => $position->id,
                'name' => str_repeat('a', 256), // Name exceeds 255 characters
                'description' => 'Too long name',
            ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_candidate_description_is_optional()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $partylist = Partylist::factory()->create(['election_id' => $election->id]);
        $position = Position::factory()->create(['election_id' => $election->id]);

        $response = $this->actingAs($user)
            ->post(route('admin.election.candidates.store', $election->id), [
                'partylist' => $partylist->id,
                'position' => $position->id,
                'name' => 'Optional Description',
                'description' => null,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('candidates', [
            'name' => 'Optional Description',
            'description' => null,
        ]);
    }

    public function test_candidate_can_be_updated()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $partylist = Partylist::factory()->create(['election_id' => $election->id]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'partylist_id' => $partylist->id,
            'position_id' => $position->id,
            'name' => 'Original Name',
        ]);

        $newPartylist = Partylist::factory()->create(['election_id' => $election->id]);
        
        $response = $this->actingAs($user)
            ->patch(route('admin.election.candidates.update', [$election->id, $candidate->id]), [
                'partylist' => $newPartylist->id,
                'position' => $position->id,
                'name' => 'Updated Name',
                'description' => 'Updated description',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Candidate Updated Name updated.');

        $this->assertDatabaseHas('candidates', [
            'id' => $candidate->id,
            'name' => 'Updated Name',
            'partylist_id' => $newPartylist->id,
            'description' => 'Updated description',
        ]);
    }

    public function test_candidate_can_be_deleted()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $partylist = Partylist::factory()->create(['election_id' => $election->id]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'partylist_id' => $partylist->id,
            'position_id' => $position->id,
            'name' => 'To Delete',
        ]);

        $response = $this->actingAs($user)
            ->delete(route('admin.election.candidates.destroy', [$election->id, $candidate->id]));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Candidate To Delete deleted.');

        $this->assertDatabaseMissing('candidates', [
            'id' => $candidate->id,
        ]);
    }

    public function test_only_authenticated_admin_can_create_candidate()
    {
        $election = $this->createElectionWithSetup();
        $partylist = Partylist::factory()->create(['election_id' => $election->id]);
        $position = Position::factory()->create(['election_id' => $election->id]);

        // Unauthenticated user
        $response = $this->post(route('admin.election.candidates.store', $election->id), [
            'partylist' => $partylist->id,
            'position' => $position->id,
            'name' => 'Unauthorized',
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_multiple_candidates_in_same_position()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $partylist1 = Partylist::factory()->create(['election_id' => $election->id]);
        $partylist2 = Partylist::factory()->create(['election_id' => $election->id]);
        $position = Position::factory()->create(['election_id' => $election->id]);

        // Create first candidate
        $response1 = $this->actingAs($user)
            ->post(route('admin.election.candidates.store', $election->id), [
                'partylist' => $partylist1->id,
                'position' => $position->id,
                'name' => 'Candidate A',                'description' => null,            ]);

        $response1->assertRedirect();

        // Create second candidate for same position - should succeed (different names)
        $response2 = $this->actingAs($user)
            ->post(route('admin.election.candidates.store', $election->id), [
                'partylist' => $partylist2->id,
                'position' => $position->id,
                'name' => 'Candidate B',
                'description' => null,
            ]);

        $response2->assertRedirect();

        $this->assertDatabaseHas('candidates', [
            'position_id' => $position->id,
            'name' => 'Candidate A',
        ]);
        $this->assertDatabaseHas('candidates', [
            'position_id' => $position->id,
            'name' => 'Candidate B',
        ]);
    }

    public function test_update_candidate_with_duplicate_name_fails()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $partylist = Partylist::factory()->create(['election_id' => $election->id]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        
        $candidate1 = Candidate::factory()->create([
            'election_id' => $election->id,
            'partylist_id' => $partylist->id,
            'position_id' => $position->id,
            'name' => 'Candidate One',
        ]);

        $candidate2 = Candidate::factory()->create([
            'election_id' => $election->id,
            'partylist_id' => $partylist->id,
            'position_id' => $position->id,
            'name' => 'Candidate Two',
        ]);

        // Try to update candidate2 to have same name as candidate1
        $response = $this->actingAs($user)
            ->patch(route('admin.election.candidates.update', [$election->id, $candidate2->id]), [
                'partylist' => $partylist->id,
                'position' => $position->id,
                'name' => 'Candidate One', // Duplicate name
            ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_candidate_update_allows_same_name_for_same_candidate()
    {
        $user = $this->createAdminUser();
        $election = $this->createElectionWithSetup();
        
        $partylist = Partylist::factory()->create(['election_id' => $election->id]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'partylist_id' => $partylist->id,
            'position_id' => $position->id,
            'name' => 'Original Name',
        ]);

        // Update candidate without changing name - should succeed
        $response = $this->actingAs($user)
            ->patch(route('admin.election.candidates.update', [$election->id, $candidate->id]), [
                'partylist' => $partylist->id,
                'position' => $position->id,
                'name' => 'Original Name', // Same name
                'description' => 'Updated description',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }
}

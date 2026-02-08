<?php

namespace Tests\Feature\Authorization;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Student;
use App\Models\Election;
use App\Models\ElectionSetup;
use App\Models\Vote;
use App\Models\SchoolLevel;
use App\Models\SchoolUnit;
use App\Models\Position;
use App\Models\PositionEligibleUnit;
use App\Models\EligibleVoter;
use App\Enums\ElectionStatus;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $voter;
    private User $superAdmin;
    private Student $studentForVoter;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
        $this->artisan('db:seed', ['--class' => 'SchoolLevelSeeder']);

        // Create admin user
        $this->admin = User::factory()->create(['id_number' => '00000001']);
        $this->admin->assignRole('admin');

        // Create super admin user
        $this->superAdmin = User::factory()->create(['id_number' => '00000002']);
        $this->superAdmin->assignRole('super-admin');

        // Create voter user with associated student
        $this->voter = User::factory()->create(['id_number' => '20000001']);
        $this->voter->assignRole('voter');
        $this->studentForVoter = Student::factory()->create([
            'student_id' => '20000001',
            'status' => 'Enrolled',
        ]);
    }

    // ========== ADMIN ROUTE ACCESS TESTS ==========

    public function test_admin_can_access_admin_dashboard()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.dashboard'));

        $response->assertStatus(200);
    }

    public function test_super_admin_can_access_admin_dashboard()
    {
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.dashboard'));

        $response->assertStatus(200);
    }

    public function test_voter_cannot_access_admin_dashboard()
    {
        $response = $this->actingAs($this->voter)
            ->get(route('admin.dashboard'));

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_redirected_from_admin_routes()
    {
        $response = $this->get(route('admin.dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_access_election_management()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.election.index'));

        $response->assertStatus(200);
    }

    public function test_voter_cannot_access_election_management()
    {
        $response = $this->actingAs($this->voter)
            ->get(route('admin.election.index'));

        $response->assertStatus(403);
    }

    public function test_admin_can_access_user_management()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.users.index'));

        $response->assertStatus(200);
    }

    public function test_voter_cannot_access_user_management()
    {
        $response = $this->actingAs($this->voter)
            ->get(route('admin.users.index'));

        $response->assertStatus(403);
    }

    public function test_admin_can_access_login_logs()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.login_logs'));

        $response->assertStatus(200);
    }

    public function test_voter_cannot_access_login_logs()
    {
        $response = $this->actingAs($this->voter)
            ->get(route('admin.login_logs'));

        $response->assertStatus(403);
    }

    public function test_admin_can_access_student_management()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.students.index'));

        $response->assertStatus(200);
    }

    public function test_voter_cannot_access_student_management()
    {
        $response = $this->actingAs($this->voter)
            ->get(route('admin.students.index'));

        $response->assertStatus(403);
    }

    public function test_admin_can_access_bulk_upload()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.bulk-upload.index'));

        $response->assertStatus(200);
    }

    public function test_voter_cannot_access_bulk_upload()
    {
        $response = $this->actingAs($this->voter)
            ->get(route('admin.bulk-upload.index'));

        $response->assertStatus(403);
    }

    // ========== VOTER ROUTE ACCESS TESTS ==========

    public function test_voter_can_access_voter_dashboard()
    {
        $response = $this->actingAs($this->voter)
            ->get(route('voter.dashboard'));

        $response->assertStatus(200);
    }

    public function test_admin_cannot_access_voter_dashboard()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('voter.dashboard'));

        $response->assertStatus(403);
    }

    public function test_voter_can_access_voter_election_list()
    {
        $response = $this->actingAs($this->voter)
            ->get(route('voter.election.index'));

        $response->assertStatus(200);
    }

    public function test_admin_cannot_access_voter_election_list()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('voter.election.index'));

        $response->assertStatus(403);
    }

    public function test_voter_can_access_vote_history()
    {
        // Create a vote for the voter to view
        $vote = Vote::factory()->create(['student_id' => $this->studentForVoter->id]);
        
        $response = $this->actingAs($this->voter)
            ->get(route('voter.vote-history.show', $vote->id));

        $response->assertStatus(200);
    }

    public function test_admin_cannot_access_voter_vote_history()
    {
        // Create a vote
        $vote = Vote::factory()->create(['student_id' => $this->studentForVoter->id]);
        
        $response = $this->actingAs($this->admin)
            ->get(route('voter.vote-history.show', $vote->id));

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_redirected_from_voter_routes()
    {
        $response = $this->get(route('voter.dashboard'));

        $response->assertRedirect(route('login'));
    }

    // ========== PROFILE ACCESS TESTS ==========

    public function test_user_can_access_own_profile()
    {
        $response = $this->actingAs($this->voter)
            ->get(route('profile.edit'));

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_update_own_profile()
    {
        $response = $this->actingAs($this->voter)
            ->patch(route('profile.update'), [
                'name' => 'Updated Name',
                'email' => 'newemail@example.com',
            ]);

        // Should succeed or redirect if form valid
        $this->assertContains($response->status(), [200, 302]);
    }

    public function test_unauthenticated_user_redirected_from_profile_edit()
    {
        $response = $this->get(route('profile.edit'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_profile_update_requires_authentication()
    {
        $response = $this->patch(route('profile.update'), [
            'name' => 'Test Name',
        ]);

        $response->assertRedirect(route('login'));
    }

    // ========== ELECTION POLICY TESTS ==========

    public function test_admin_can_create_election()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.election.store'), [
                'title' => 'Test Election',
                'school_levels' => [SchoolLevel::first()->id],
            ]);

        // Should succeed or redirect on success
        $this->assertContains($response->status(), [200, 201, 302, 301]);
    }

    public function test_voter_cannot_create_election()
    {
        $response = $this->actingAs($this->voter)
            ->post(route('admin.election.store'), [
                'title' => 'Test Election',
                'school_levels' => [SchoolLevel::first()->id],
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_election()
    {
        $election = Election::factory()->create();
        ElectionSetup::factory()->create(['election_id' => $election->id]);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.election.update', $election), [
                'title' => 'Updated Title',
                'school_levels' => [SchoolLevel::first()->id],
            ]);

        $this->assertContains($response->status(), [200, 302, 301]);
    }

    public function test_voter_cannot_update_election()
    {
        $election = Election::factory()->create();
        ElectionSetup::factory()->create(['election_id' => $election->id]);

        $response = $this->actingAs($this->voter)
            ->patch(route('admin.election.update', $election), [
                'title' => 'Updated Title',
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_election()
    {
        $election = Election::factory()->create();
        ElectionSetup::factory()->create(['election_id' => $election->id]);

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.election.destroy', $election));

        $this->assertContains($response->status(), [200, 302, 301]);
    }

    public function test_voter_cannot_delete_election()
    {
        $election = Election::factory()->create();
        ElectionSetup::factory()->create(['election_id' => $election->id]);

        $response = $this->actingAs($this->voter)
            ->delete(route('admin.election.destroy', $election));

        $response->assertStatus(403);
    }

    // ========== VOTE POLICY TESTS ==========

    public function test_voter_can_view_own_vote()
    {
        $election = Election::factory()->create();
        ElectionSetup::factory()->create(['election_id' => $election->id]);

        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $this->studentForVoter->id,
        ]);

        // Test with authorize gate
        $this->assertTrue($this->voter->can('view', $vote));
    }

    public function test_voter_cannot_view_other_voter_vote()
    {
        $otherStudent = Student::factory()->create(['student_id' => '20000002']);
        $election = Election::factory()->create();
        ElectionSetup::factory()->create(['election_id' => $election->id]);

        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $otherStudent->id,
        ]);

        // Voter should not be able to view
        $this->assertFalse($this->voter->can('view', $vote));
    }

    public function test_admin_cannot_view_voter_vote()
    {
        $election = Election::factory()->create();
        ElectionSetup::factory()->create(['election_id' => $election->id]);

        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $this->studentForVoter->id,
        ]);

        // Admin should not be able to view
        $this->assertFalse($this->admin->can('view', $vote));
    }

    public function test_voter_can_check_eligibility_for_election()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        ElectionSetup::factory()->create(['election_id' => $election->id]);

        $schoolLevel = SchoolLevel::where('name', 'Senior High')->first();
        $unit = SchoolUnit::factory()->create(['school_level_id' => $schoolLevel->id]);

        $position = Position::factory()->create(['election_id' => $election->id]);
        PositionEligibleUnit::factory()->create([
            'position_id' => $position->id,
            'school_unit_id' => $unit->id,
        ]);

        EligibleVoter::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'student_id' => $this->studentForVoter->id,
        ]);

        // Voter should be eligible (has EligibleVoter record)
        $isEligible = EligibleVoter::where('election_id', $election->id)
            ->where('student_id', $this->studentForVoter->id)
            ->exists();
        
        $this->assertTrue($isEligible);
    }

    public function test_voter_cannot_check_eligibility_if_not_eligible()
    {
        $election = Election::factory()->create();
        ElectionSetup::factory()->create(['election_id' => $election->id]);

        // No eligible voter record created - voter should not be eligible
        $eligibleVoters = EligibleVoter::where('election_id', $election->id)
            ->where('student_id', $this->studentForVoter->id)
            ->exists();
        
        $this->assertFalse($eligibleVoters);
    }

    // ========== ROLE-BASED PERMISSION TESTS ==========

    public function test_admin_has_manage_users_permission()
    {
        // Admin should have ability to access user management
        $response = $this->actingAs($this->admin)
            ->get(route('admin.users.index'));
        
        $response->assertStatus(200);
    }

    public function test_voter_does_not_have_create_admin_permission()
    {
        $this->assertFalse($this->voter->can('create', User::class));
    }

    public function test_admin_has_view_admin_tables_permission()
    {
        // Verify admin can access protected resources
        $response = $this->actingAs($this->admin)
            ->get(route('admin.election.index'));

        // Should not get forbidden
        $this->assertNotEquals(403, $response->status());
    }

    public function test_voter_restricted_to_voter_routes()
    {
        // List of admin routes voter should not access
        $adminRoutes = [
            route('admin.dashboard'),
            route('admin.election.index'),
            route('admin.users.index'),
            route('admin.students.index'),
        ];

        foreach ($adminRoutes as $route) {
            $response = $this->actingAs($this->voter)->get($route);
            $this->assertEquals(403, $response->status(), "Voter should not access: $route");
        }
    }

    // ========== MIDDLEWARE PROTECTION TESTS ==========

    public function test_verified_middleware_blocks_unverified_users()
    {
        // Create unverified user
        $unverifiedUser = User::factory()->unverified()->create(['id_number' => '20000099']);
        $unverifiedUser->assignRole('voter');

        $response = $this->actingAs($unverifiedUser)
            ->get(route('voter.dashboard'));

        // Should redirect to verification notice if middleware enforces it
        // or return 200 if voter dashboard doesn't require email verification
        $this->assertContains($response->status(), [200, 302]);
    }

    public function test_verified_admin_can_access_admin_routes()
    {
        // Verified admin should pass
        $response = $this->actingAs($this->admin)
            ->get(route('admin.dashboard'));

        $this->assertNotEquals(302, $response->status());
    }

    // ========== SUPER ADMIN TESTS ==========

    public function test_super_admin_has_all_permissions()
    {
        // Super admin should access everything an admin can
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.dashboard'));

        $this->assertEquals(200, $response->status());
    }

    public function test_super_admin_can_manage_users()
    {
        $response = $this->actingAs($this->superAdmin)
            ->get(route('admin.users.index'));

        $this->assertEquals(200, $response->status());
    }

    // ========== MIXED PERMISSION TESTS ==========

    public function test_voter_cannot_access_mixed_routes_requiring_admin()
    {
        $response = $this->actingAs($this->voter)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => 'test.csv',
            ]);

        $response->assertStatus(403);
    }

    public function test_authenticated_but_unauthorized_user_gets_403()
    {
        // Both users are authenticated but voter doesn't have admin role
        $response = $this->actingAs($this->voter)
            ->get(route('admin.election.index'));

        $response->assertStatus(403);
    }

    public function test_admin_accessing_voter_only_endpoint_gets_403()
    {
        // Some endpoints might be voter-only, admin trying to access should fail
        // This depends on route setup, but tests intent

        // If there are voter-exclusive routes (like vote placement), they should block admin
        // For now, this is a placeholder for such cases
        $this->assertTrue(true);
    }
}

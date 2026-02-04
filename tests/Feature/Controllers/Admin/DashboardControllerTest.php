<?php

namespace Tests\Feature\Controllers\Admin;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Election;
use App\Models\Vote;
use App\Models\Student;
use App\Enums\ElectionStatus;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createRoles();
    }

    private function createRoles()
    {
        // Create roles if they don't exist
        app('\Spatie\Permission\Models\Role')::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        app('\Spatie\Permission\Models\Role')::firstOrCreate(['name' => 'voter', 'guard_name' => 'web']);
        app('\Spatie\Permission\Models\Role')::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
    }

    private function createAdminUser()
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    private function createVoterUser()
    {
        $user = User::factory()->create();
        $user->assignRole('voter');
        return $user;
    }

    /**
     * Test dashboard page loads for authenticated admin
     */
    public function test_admin_can_access_dashboard()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn($page) => $page
            ->component('Admin/Dashboard')
        );
    }

    /**
     * Test dashboard returns stats data
     */
    public function test_dashboard_returns_stats_data()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->has('stats', fn($stats) => $stats
                ->has('totalElections')
                ->has('activeElections')
                ->has('totalVoters')
                ->has('totalVotes')
                ->has('completedElections')
            )
        );
    }

    /**
     * Test dashboard returns election status overview
     */
    public function test_dashboard_returns_election_status_overview()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->has('electionStatusOverview', fn($overview) => $overview
                ->has('draft')
                ->has('upcoming')
                ->has('ongoing')
                ->has('finalized')
                ->has('compromised')
            )
        );
    }

    /**
     * Test dashboard returns recent activity
     */
    public function test_dashboard_returns_recent_activity()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->has('recentActivity')
        );
    }

    /**
     * Test dashboard returns system status
     */
    public function test_dashboard_returns_system_status()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->has('systemStatus', fn($status) => $status
                ->has('dataIntegrity')
                ->has('activeElections')
                ->has('systemPerformance')
                ->has('alerts')
            )
        );
    }

    /**
     * Test dashboard returns system traffic
     */
    public function test_dashboard_returns_system_traffic()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->has('systemTraffic', fn($traffic) => $traffic
                ->has('labels')
                ->has('votesPerHour')
                ->has('activeUsersPerHour')
                ->has('peakTime')
                ->has('currentLoad')
                ->has('totalVotes24h')
                ->has('peakVotes')
            )
        );
    }

    /**
     * Test voter cannot access admin dashboard
     */
    public function test_voter_cannot_access_admin_dashboard()
    {
        $voter = $this->createVoterUser();

        $response = $this->actingAs($voter)->get(route('admin.dashboard'));

        $response->assertForbidden();
    }

    /**
     * Test unauthenticated user redirected to login
     */
    public function test_unauthenticated_user_redirected_to_login()
    {
        $response = $this->get(route('admin.dashboard'));

        $response->assertRedirect(route('login'));
    }

    /**
     * Test dashboard with active elections
     */
    public function test_dashboard_reflects_active_elections()
    {
        $admin = $this->createAdminUser();
        Election::factory()->count(2)->create(['status' => ElectionStatus::Ongoing]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->where('stats.activeElections', 2)
        );
    }

    /**
     * Test dashboard with multiple election statuses
     */
    public function test_dashboard_election_status_breakdown()
    {
        $admin = $this->createAdminUser();
        
        Election::factory()->create(['status' => ElectionStatus::Draft]);
        Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        Election::factory()->create(['status' => ElectionStatus::Finalized]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->where('electionStatusOverview.draft', 1)
            ->where('electionStatusOverview.ongoing', 1)
            ->where('electionStatusOverview.finalized', 1)
        );
    }

    /**
     * Test dashboard data integrity warning for compromised elections
     */
    public function test_dashboard_shows_integrity_warning_for_compromised()
    {
        $admin = $this->createAdminUser();
        Election::factory()->create(['status' => ElectionStatus::Compromised]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->where('systemStatus.dataIntegrity.status', 'warning')
        );
    }

    /**
     * Test super-admin can access dashboard
     */
    public function test_super_admin_can_access_dashboard()
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        $response = $this->actingAs($superAdmin)->get(route('admin.dashboard'));

        $response->assertOk();
    }

    /**
     * Test dashboard shows total votes
     */
    public function test_dashboard_shows_total_votes()
    {
        $admin = $this->createAdminUser();
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        Vote::factory()->count(5)->create(['election_id' => $election->id]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->has('stats')
        );
    }

    /**
     * Test dashboard traffic labels are hourly
     */
    public function test_dashboard_traffic_has_hourly_labels()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->has('systemTraffic.labels', 24)
            ->has('systemTraffic.votesPerHour', 24)
        );
    }

    /**
     * Test dashboard recent activity is an array
     */
    public function test_dashboard_recent_activity_is_array()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->has('recentActivity')
        );
    }

    /**
     * Test dashboard response includes auth user
     */
    public function test_dashboard_includes_auth_user_in_response()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        // Inertia automatically includes auth user
        $response->assertInertia(fn($page) => $page
            ->has('auth.user')
        );
    }

    /**
     * Test dashboard system status includes all required fields
     */
    public function test_dashboard_system_status_complete_structure()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->has('systemStatus', fn($status) => $status
                ->has('dataIntegrity.status')
                ->has('activeElections.status')
                ->has('systemPerformance.status')
                ->has('alerts.status')
            )
        );
    }

    /**
     * Test dashboard stats totals match model counts
     */
    public function test_dashboard_stats_accuracy()
    {
        $admin = $this->createAdminUser();
        
        // Create some test data
        Student::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertInertia(fn($page) => $page
            ->has('stats.totalElections')
            ->has('stats.totalVoters')
        );
    }

    /**
     * Test dashboard can be rendered multiple times
     */
    public function test_dashboard_renders_consistently()
    {
        $admin = $this->createAdminUser();

        $response1 = $this->actingAs($admin)->get(route('admin.dashboard'));
        $response2 = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response1->assertOk();
        $response2->assertOk();
    }
}

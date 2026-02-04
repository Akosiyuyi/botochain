<?php

namespace Tests\Feature\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\AdminDashboardViewService;
use App\Models\Election;
use App\Models\Vote;
use App\Models\Student;
use App\Models\User;
use App\Models\LoginLogs;
use App\Enums\ElectionStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\DB;

class AdminDashboardViewServiceTest extends TestCase
{
    use RefreshDatabase;

    private AdminDashboardViewService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(AdminDashboardViewService::class);
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

    /**
     * Test that dashboard returns complete data structure
     */
    public function test_dashboard_returns_complete_data_structure()
    {
        $data = $this->service->getDashboardData();

        $this->assertArrayHasKey('stats', $data);
        $this->assertArrayHasKey('electionStatusOverview', $data);
        $this->assertArrayHasKey('recentActivity', $data);
        $this->assertArrayHasKey('systemStatus', $data);
        $this->assertArrayHasKey('systemTraffic', $data);
    }

    /**
     * Test that stats include all required fields
     */
    public function test_dashboard_stats_includes_required_fields()
    {
        $data = $this->service->getDashboardData();
        $stats = $data['stats'];

        $this->assertArrayHasKey('totalElections', $stats);
        $this->assertArrayHasKey('activeElections', $stats);
        $this->assertArrayHasKey('totalVoters', $stats);
        $this->assertArrayHasKey('totalVotes', $stats);
        $this->assertArrayHasKey('completedElections', $stats);
    }

    /**
     * Test stats calculation with elections
     */
    public function test_dashboard_stats_calculation_with_elections()
    {
        // Create test data
        Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        Election::factory()->create(['status' => ElectionStatus::Finalized]);

        $data = $this->service->getDashboardData();
        $stats = $data['stats'];

        // Verify counts
        $this->assertGreaterThanOrEqual(1, $stats['activeElections']);
        $this->assertGreaterThanOrEqual(1, $stats['completedElections']);
        $this->assertGreaterThanOrEqual(2, $stats['totalElections']);
    }

    /**
     * Test election status overview breakdown
     */
    public function test_election_status_overview()
    {
        // Create elections in different statuses
        Election::factory()->create(['status' => ElectionStatus::Draft]);
        Election::factory()->create(['status' => ElectionStatus::Upcoming]);
        Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        Election::factory()->create(['status' => ElectionStatus::Finalized]);
        Election::factory()->create(['status' => ElectionStatus::Compromised]);

        $data = $this->service->getDashboardData();
        $overview = $data['electionStatusOverview'];

        $this->assertArrayHasKey('draft', $overview);
        $this->assertArrayHasKey('upcoming', $overview);
        $this->assertArrayHasKey('ongoing', $overview);
        $this->assertArrayHasKey('finalized', $overview);
        $this->assertArrayHasKey('compromised', $overview);

        $this->assertEquals(1, $overview['draft']);
        $this->assertEquals(1, $overview['upcoming']);
        $this->assertEquals(1, $overview['ongoing']);
        $this->assertEquals(1, $overview['finalized']);
        $this->assertEquals(1, $overview['compromised']);
    }

    /**
     * Test that active elections count is accurate
     */
    public function test_active_elections_count()
    {
        Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        Election::factory()->create(['status' => ElectionStatus::Draft]);

        $data = $this->service->getDashboardData();
        $stats = $data['stats'];

        $this->assertEquals(2, $stats['activeElections']);
    }

    /**
     * Test recent activity includes elections and votes
     */
    public function test_recent_activity_includes_activities()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        
        // Create some votes
        Vote::factory()->count(3)->create([
            'election_id' => $election->id,
        ]);

        $data = $this->service->getDashboardData();
        $activities = $data['recentActivity'];

        $this->assertIsArray($activities);
        // Should have activities (elections created and votes cast)
        $this->assertGreaterThan(0, count($activities));
    }

    /**
     * Test system status structure
     */
    public function test_system_status_structure()
    {
        $data = $this->service->getDashboardData();
        $status = $data['systemStatus'];

        $this->assertArrayHasKey('dataIntegrity', $status);
        $this->assertArrayHasKey('activeElections', $status);
        $this->assertArrayHasKey('systemPerformance', $status);
        $this->assertArrayHasKey('alerts', $status);

        // Each status item should have 'status' key
        $this->assertArrayHasKey('status', $status['dataIntegrity']);
        $this->assertArrayHasKey('status', $status['activeElections']);
        $this->assertArrayHasKey('status', $status['systemPerformance']);
        $this->assertArrayHasKey('status', $status['alerts']);
    }

    /**
     * Test data integrity detection for compromised elections
     */
    public function test_data_integrity_shows_warning_for_compromised_elections()
    {
        Election::factory()->create(['status' => ElectionStatus::Compromised]);

        $data = $this->service->getDashboardData();
        $status = $data['systemStatus'];

        $this->assertEquals('warning', $status['dataIntegrity']['status']);
        $this->assertNotNull($status['dataIntegrity']['message']);
    }

    /**
     * Test data integrity shows healthy when no compromised elections
     */
    public function test_data_integrity_shows_healthy_when_no_compromised_elections()
    {
        Election::factory()->create(['status' => ElectionStatus::Draft]);
        Election::factory()->create(['status' => ElectionStatus::Ongoing]);

        $data = $this->service->getDashboardData();
        $status = $data['systemStatus'];

        $this->assertEquals('healthy', $status['dataIntegrity']['status']);
    }

    /**
     * Test system traffic data structure
     */
    public function test_system_traffic_includes_required_fields()
    {
        $data = $this->service->getDashboardData();
        $traffic = $data['systemTraffic'];

        $this->assertArrayHasKey('labels', $traffic);
        $this->assertArrayHasKey('votesPerHour', $traffic);
        $this->assertArrayHasKey('activeUsersPerHour', $traffic);
        $this->assertArrayHasKey('peakTime', $traffic);
        $this->assertArrayHasKey('currentLoad', $traffic);
        $this->assertArrayHasKey('totalVotes24h', $traffic);
        $this->assertArrayHasKey('peakVotes', $traffic);
    }

    /**
     * Test system traffic generates 24 hour labels
     */
    public function test_system_traffic_generates_24_hour_labels()
    {
        $data = $this->service->getDashboardData();
        $traffic = $data['systemTraffic'];

        $this->assertCount(24, $traffic['labels']);
        $this->assertCount(24, $traffic['votesPerHour']);
        $this->assertCount(24, $traffic['activeUsersPerHour']);
    }

    /**
     * Test system traffic with votes in current hour
     */
    public function test_system_traffic_calculates_votes_per_hour()
    {
        $election = Election::factory()->create();
        
        // Create votes in the current hour
        Vote::factory()->count(5)->create([
            'election_id' => $election->id,
            'created_at' => now(),
        ]);

        $data = $this->service->getDashboardData();
        $traffic = $data['systemTraffic'];

        $this->assertGreaterThan(0, $traffic['totalVotes24h']);
    }

    /**
     * Test peak time calculation
     */
    public function test_system_traffic_calculates_peak_time()
    {
        $election = Election::factory()->create();
        
        // Create many votes at a specific hour
        $peakHour = now()->subHours(5)->startOfHour();
        Vote::factory()->count(10)->create([
            'election_id' => $election->id,
            'created_at' => $peakHour,
        ]);

        $data = $this->service->getDashboardData();
        $traffic = $data['systemTraffic'];

        $this->assertNotNull($traffic['peakTime']);
        $this->assertGreaterThan(0, $traffic['peakVotes']);
    }

    /**
     * Test system load classification
     */
    public function test_system_traffic_load_classification()
    {
        $election = Election::factory()->create();
        Vote::factory()->count(3)->create([
            'election_id' => $election->id,
            'created_at' => now(),
        ]);

        $data = $this->service->getDashboardData();
        $traffic = $data['systemTraffic'];

        // Load should be one of: low, medium, high
        $validLoads = ['low', 'medium', 'high'];
        $this->assertTrue(in_array($traffic['currentLoad'], $validLoads), 
            "Current load '{$traffic['currentLoad']}' is not one of: " . implode(', ', $validLoads));
    }

    /**
     * Test system status with active elections shows active state
     */
    public function test_active_elections_status_shows_active_when_ongoing()
    {
        Election::factory()->create(['status' => ElectionStatus::Ongoing]);

        $data = $this->service->getDashboardData();
        $status = $data['systemStatus'];

        $this->assertEquals('active', $status['activeElections']['status']);
        $this->assertNotNull($status['activeElections']['message']);
    }

    /**
     * Test system status with no active elections shows optimal
     */
    public function test_active_elections_status_shows_optimal_when_none_ongoing()
    {
        Election::factory()->create(['status' => ElectionStatus::Draft]);

        $data = $this->service->getDashboardData();
        $status = $data['systemStatus'];

        $this->assertEquals('optimal', $status['activeElections']['status']);
    }

    /**
     * Test completed elections calculation
     */
    public function test_completed_elections_calculation()
    {
        Election::factory()->create(['status' => ElectionStatus::Finalized]);
        Election::factory()->create(['status' => ElectionStatus::Finalized]);
        Election::factory()->create(['status' => ElectionStatus::Draft]);

        $data = $this->service->getDashboardData();
        $stats = $data['stats'];

        $this->assertEquals(2, $stats['completedElections']);
    }

    /**
     * Test completion rate calculation
     */
    public function test_completion_rate_with_multiple_elections()
    {
        Election::factory()->create(['status' => ElectionStatus::Finalized]);
        Election::factory()->create(['status' => ElectionStatus::Finalized]);
        Election::factory()->create(['status' => ElectionStatus::Draft]);
        Election::factory()->create(['status' => ElectionStatus::Ongoing]);

        $data = $this->service->getDashboardData();
        $stats = $data['stats'];

        // 2 completed out of 4 total = 50%
        $this->assertEquals(2, $stats['completedElections']);
        $this->assertEquals(4, $stats['totalElections']);
    }

    /**
     * Test alert message for stale draft elections
     */
    public function test_alert_message_for_stale_draft_elections()
    {
        // Create old draft election (more than 7 days old)
        Election::factory()->create([
            'status' => ElectionStatus::Draft,
            'created_at' => now()->subDays(8),
        ]);

        $data = $this->service->getDashboardData();
        $status = $data['systemStatus'];

        $this->assertNotNull($status['alerts']['message']);
    }

    /**
     * Test alert message for compromised elections takes priority
     */
    public function test_alert_message_for_compromised_elections_takes_priority()
    {
        Election::factory()->create([
            'status' => ElectionStatus::Compromised,
        ]);
        
        Election::factory()->create([
            'status' => ElectionStatus::Draft,
            'created_at' => now()->subDays(8),
        ]);

        $data = $this->service->getDashboardData();
        $status = $data['systemStatus'];

        $this->assertStringContainsString('compromised', $status['alerts']['message']);
    }

    /**
     * Test voters count in stats
     */
    public function test_voters_count_in_stats()
    {
        Student::factory()->count(5)->create();

        $data = $this->service->getDashboardData();
        $stats = $data['stats'];

        $this->assertGreaterThanOrEqual(5, $stats['totalVoters']);
    }

    /**
     * Test total votes count
     */
    public function test_total_votes_count()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        Vote::factory()->count(10)->create(['election_id' => $election->id]);

        $data = $this->service->getDashboardData();
        $stats = $data['stats'];

        $this->assertGreaterThanOrEqual(10, $stats['totalVotes']);
    }

    /**
     * Test system performance status when healthy
     */
    public function test_system_performance_status_when_healthy()
    {
        $data = $this->service->getDashboardData();
        $status = $data['systemStatus'];

        // Should have a status field
        $this->assertArrayHasKey('status', $status['systemPerformance']);
        $this->assertIsString($status['systemPerformance']['status']);
    }

    /**
     * Test login logs aggregation for active users
     */
    public function test_system_traffic_includes_login_data()
    {
        // Create login logs for different users in current hour
        LoginLogs::create([
            'email' => 'user1@test.com',
            'status' => true,
            'login_attempt_time' => now(),
        ]);
        LoginLogs::create([
            'email' => 'user2@test.com',
            'status' => true,
            'login_attempt_time' => now(),
        ]);

        $data = $this->service->getDashboardData();
        $traffic = $data['systemTraffic'];

        $this->assertGreaterThan(0, array_sum($traffic['activeUsersPerHour']));
    }

    /**
     * Test election with votes shows in recent activity
     */
    public function test_recent_activity_shows_elections_with_votes()
    {
        $election = Election::factory()->create([
            'title' => 'Test Election',
            'status' => ElectionStatus::Ongoing,
        ]);
        
        Vote::factory()->count(5)->create([
            'election_id' => $election->id,
        ]);

        $data = $this->service->getDashboardData();
        $activities = $data['recentActivity'];

        // Should contain voting activity
        $hasVotingActivity = collect($activities)->contains(
            fn($activity) => strpos(strtolower($activity['title']), 'votes') !== false
        );
        
        $this->assertTrue($hasVotingActivity);
    }
}

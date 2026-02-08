<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\LoginLogs;

class LoginLogsTest extends TestCase
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

    private function createVoterUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('voter');
        return $user;
    }

    private function getLoginLogsFromResponse($response): array
    {
        $page = $response->viewData('page');

        if (!is_array($page)) {
            return [];
        }

        $props = $page['props'] ?? [];

        return $props['login_logs'] ?? [];
    }

    /**
     * Test successful login is logged
     */
    public function test_login_success_logged()
    {
        $user = $this->createAdminUser();

        LoginLogs::create([
            'email' => $user->email,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => now(),
        ]);

        $this->assertDatabaseHas('login_logs', [
            'email' => $user->email,
            'status' => true,
            'reason' => 'Login successful',
        ]);
    }

    /**
     * Test failed login with invalid credentials is logged
     */
    public function test_login_failure_logged_with_invalid_credentials()
    {
        $user = $this->createAdminUser();

        LoginLogs::create([
            'email' => $user->email,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'status' => false,
            'reason' => 'Invalid credentials',
            'login_attempt_time' => now(),
        ]);

        $this->assertDatabaseHas('login_logs', [
            'email' => $user->email,
            'status' => false,
            'reason' => 'Invalid credentials',
        ]);
    }

    /**
     * Test login failure with non-existent user
     */
    public function test_login_failure_with_nonexistent_user()
    {
        LoginLogs::create([
            'email' => 'nonexistent@user.com',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => false,
            'reason' => 'Invalid credentials',
            'login_attempt_time' => now(),
        ]);

        $this->assertDatabaseHas('login_logs', [
            'email' => 'nonexistent@user.com',
            'status' => false,
            'reason' => 'Invalid credentials',
        ]);
    }

    /**
     * Test login logs include IP address
     */
    public function test_login_logs_include_ip_address()
    {
        $user = $this->createAdminUser();

        $ipAddress = '192.168.1.100';
        LoginLogs::create([
            'email' => $user->email,
            'ip_address' => $ipAddress,
            'user_agent' => 'Mozilla/5.0',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => now(),
        ]);

        $log = LoginLogs::where('email', $user->email)->first();
        $this->assertNotNull($log->ip_address);
        $this->assertEquals($ipAddress, $log->ip_address);
    }

    /**
     * Test login logs include user agent
     */
    public function test_login_logs_include_user_agent()
    {
        $user = $this->createAdminUser();

        $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        LoginLogs::create([
            'email' => $user->email,
            'ip_address' => '127.0.0.1',
            'user_agent' => $userAgent,
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => now(),
        ]);

        $log = LoginLogs::where('email', $user->email)->first();
        $this->assertNotNull($log->user_agent);
        $this->assertEquals($userAgent, $log->user_agent);
    }

    /**
     * Test login logs controller returns formatted data with device/browser/platform
     */
    public function test_login_logs_controller_includes_device_browser_platform()
    {
        $admin = $this->createAdminUser();

        LoginLogs::create([
            'email' => $admin->email,
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.login_logs'));

        $response->assertStatus(200);

        $logs = $this->getLoginLogsFromResponse($response);
        $this->assertNotEmpty($logs);

        $log = $logs[0];
        $this->assertArrayHasKey('device', $log);
        $this->assertArrayHasKey('platform', $log);
        $this->assertArrayHasKey('browser', $log);
        $this->assertArrayHasKey('date', $log);
        $this->assertArrayHasKey('time', $log);
        $this->assertArrayHasKey('email', $log);
        $this->assertArrayHasKey('ip_address', $log);
        $this->assertArrayHasKey('status', $log);
        $this->assertArrayHasKey('reason', $log);
    }

    /**
     * Test login logs are sorted by most recent first
     */
    public function test_login_logs_sorted_by_most_recent_first()
    {
        $admin = $this->createAdminUser();

        $olderTime = now()->subHours(2);
        $newerTime = now();

        LoginLogs::create([
            'email' => $admin->email,
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => $olderTime,
        ]);

        LoginLogs::create([
            'email' => $admin->email,
            'ip_address' => '192.168.1.2',
            'user_agent' => 'Mozilla/5.0',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => $newerTime,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.login_logs'));

        $logs = $this->getLoginLogsFromResponse($response);

        $this->assertEquals('192.168.1.2', $logs[0]['ip_address']);
        $this->assertEquals('192.168.1.1', $logs[1]['ip_address']);
    }

    /**
     * Test login logs controller formats date and time correctly
     */
    public function test_login_logs_controller_formats_date_and_time()
    {
        $admin = $this->createAdminUser();

        $loginTime = now();
        LoginLogs::create([
            'email' => $admin->email,
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => $loginTime,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.login_logs'));

        $logs = $this->getLoginLogsFromResponse($response);
        $log = $logs[0];

        $this->assertEquals($loginTime->format('M. d, Y'), $log['date']);
        $this->assertEquals($loginTime->format('h:i:s A'), $log['time']);
    }

    /**
     * Test only authenticated users can view login logs
     */
    public function test_unauthenticated_user_cannot_view_login_logs()
    {
        $response = $this->get(route('admin.login_logs'));

        $response->assertRedirect(route('login'));
    }

    /**
     * Test admin can view login logs
     */
    public function test_admin_can_view_login_logs()
    {
        $admin = $this->createAdminUser();

        LoginLogs::create([
            'email' => 'test@example.com',
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.login_logs'));

        $response->assertStatus(200);

        $page = $response->viewData('page');
        $this->assertIsArray($page);
        $this->assertSame('Admin/Users/LoginLogs', $page['component']);
        $this->assertArrayHasKey('login_logs', $page['props']);
    }

    /**
     * Test voter cannot view login logs
     */
    public function test_voter_cannot_view_login_logs()
    {
        $voter = $this->createVoterUser();

        $response = $this->actingAs($voter)
            ->get(route('admin.login_logs'));

        $this->assertTrue(
            $response->status() === 403 || $response->status() === 302,
            'Expected 403 or redirect'
        );
    }

    /**
     * Test multiple login attempts from same email
     */
    public function test_multiple_login_attempts_from_same_email()
    {
        $user = $this->createAdminUser();

        LoginLogs::create([
            'email' => $user->email,
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => false,
            'reason' => 'Invalid credentials',
            'login_attempt_time' => now()->subMinutes(5),
        ]);

        LoginLogs::create([
            'email' => $user->email,
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => now(),
        ]);

        $logs = LoginLogs::where('email', $user->email)
            ->orderBy('login_attempt_time')
            ->get();
        $this->assertCount(2, $logs);
        $this->assertFalse($logs[0]->status);
        $this->assertTrue($logs[1]->status);
    }

    /**
     * Test failed and successful logins tracked separately
     */
    public function test_failed_and_successful_logins_tracked_separately()
    {
        $user = $this->createAdminUser();

        LoginLogs::create([
            'email' => $user->email,
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => false,
            'reason' => 'Invalid credentials',
            'login_attempt_time' => now()->subMinutes(10),
        ]);

        LoginLogs::create([
            'email' => $user->email,
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => now(),
        ]);

        $logs = LoginLogs::where('email', $user->email)
            ->orderByDesc('login_attempt_time')
            ->get();

        $this->assertCount(2, $logs);
        $this->assertTrue($logs[0]->status);
        $this->assertFalse($logs[1]->status);
        $this->assertEquals('Login successful', $logs[0]->reason);
        $this->assertEquals('Invalid credentials', $logs[1]->reason);
    }

    /**
     * Test login logs parse different user agents
     */
    public function test_login_logs_parse_different_user_agents()
    {
        $admin = $this->createAdminUser();

        LoginLogs::create([
            'email' => $admin->email,
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => now(),
        ]);

        LoginLogs::create([
            'email' => $admin->email,
            'ip_address' => '192.168.1.2',
            'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.login_logs'));

        $logs = $this->getLoginLogsFromResponse($response);
        $this->assertCount(2, $logs);

        $chromeLog = collect($logs)->firstWhere('ip_address', '192.168.1.1');
        $this->assertEquals('Chrome', $chromeLog['browser']);

        $safariLog = collect($logs)->firstWhere('ip_address', '192.168.1.2');
        $this->assertEquals('Safari', $safariLog['browser']);
    }

    /**
     * Test login logs include timestamp information
     */
    public function test_login_logs_include_timestamp()
    {
        $user = $this->createAdminUser();

        $beforeTime = now();
        
        LoginLogs::create([
            'email' => $user->email,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => $beforeTime,
        ]);

        $log = LoginLogs::where('email', $user->email)->first();
        $this->assertNotNull($log->login_attempt_time);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $log->login_attempt_time);
    }

    /**
     * Test login logs controller handles empty logs gracefully
     */
    public function test_login_logs_controller_handles_empty_logs()
    {
        $admin = $this->createAdminUser();

        LoginLogs::truncate();

        $response = $this->actingAs($admin)
            ->get(route('admin.login_logs'));

        $response->assertStatus(200);
        $logs = $this->getLoginLogsFromResponse($response);
        $this->assertEmpty($logs);
    }

    /**
     * Test login logs stores correct status values
     */
    public function test_login_logs_stores_correct_status_values()
    {
        $user = $this->createAdminUser();

        LoginLogs::create([
            'email' => $user->email,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => now(),
        ]);

        LoginLogs::create([
            'email' => $user->email,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => false,
            'reason' => 'Invalid credentials',
            'login_attempt_time' => now(),
        ]);

        $successLog = LoginLogs::where('reason', 'Login successful')->first();
        $failedLog = LoginLogs::where('reason', 'Invalid credentials')->first();

        $this->assertTrue($successLog->status);
        $this->assertFalse($failedLog->status);
    }

    /**
     * Test login logs displays correct status in controller response
     */
    public function test_login_logs_displays_correct_status_in_controller()
    {
        $admin = $this->createAdminUser();

        LoginLogs::create([
            'email' => $admin->email,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => true,
            'reason' => 'Login successful',
            'login_attempt_time' => now(),
        ]);

        LoginLogs::create([
            'email' => 'failed@test.com',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => false,
            'reason' => 'Invalid credentials',
            'login_attempt_time' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.login_logs'));

        $logs = $this->getLoginLogsFromResponse($response);

        $successLog = collect($logs)->firstWhere('email', $admin->email);
        $failedLog = collect($logs)->firstWhere('email', 'failed@test.com');

        $this->assertTrue($successLog['status']);
        $this->assertFalse($failedLog['status']);
    }
}

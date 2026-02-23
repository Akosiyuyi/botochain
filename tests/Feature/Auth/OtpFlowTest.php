<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

class OtpFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }

    /**
     * Test that OTP is generated after successful login credentials
     */
    public function test_otp_sent_after_login()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);
        $user->assignRole('voter');

        // Submit login credentials
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        // Should redirect to OTP page, not authenticate yet
        $response->assertRedirect(route('otp'));
        $this->assertGuest();

        // Verify OTP was generated for user
        $otp = $user->fresh()->currentOneTimePassword();
        $this->assertNotNull($otp);
        $this->assertNotEmpty($otp->password); // OTP code

        // Verify session has pre_2fa_user_id
        $this->assertTrue(session()->has('pre_2fa_user_id'));
        $this->assertEquals($user->id, session('pre_2fa_user_id'));
    }

    /**
     * Test complete OTP verification workflow
     */
    public function test_otp_verification_workflow()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);
        $user->assignRole('voter');

        // Step 1: Login with credentials
        $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        // Step 2: Get OTP from user's current OTP
        $otp = $user->fresh()->currentOneTimePassword();
        $this->assertNotNull($otp);

        // Step 3: Verify OTP
        $response = $this->post('/otp', [
            'otp' => $otp->password, // Use 'password' field, not 'code'
        ]);

        // Should be authenticated and redirected to dashboard
        $this->assertAuthenticated();
        $response->assertRedirect(route('voter.dashboard'));

        // Session should be cleaned up
        $this->assertFalse(session()->has('pre_2fa_user_id'));
        $this->assertTrue(session()->has('2fa_verified'));
    }

    /**
     * Test that invalid OTP is rejected
     */
    public function test_invalid_otp_rejected()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);
        $user->assignRole('voter');

        // Login first to get to OTP step
        $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        // Submit invalid OTP
        $response = $this->post('/otp', [
            'otp' => '000000', // Invalid code
        ]);

        // Should not be authenticated
        $this->assertGuest();
        $response->assertSessionHasErrors('otp');
        
        // Should stay on OTP page
        $response->assertRedirect();
    }

    /**
     * Test expired OTP is rejected
     */
    public function test_expired_otp_rejected()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);
        $user->assignRole('voter');

        // Login to generate OTP
        $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $otp = $user->fresh()->currentOneTimePassword();

        // Manually expire the OTP by updating expires_at in the past
        $otp->update(['expires_at' => now()->subMinutes(10)]);

        // Try to use the expired OTP
        $response = $this->post('/otp', [
            'otp' => $otp->password,
        ]);

        // Should not be authenticated
        $this->assertGuest();
        $response->assertSessionHasErrors('otp');
    }

    /**
     * Test OTP page redirects to login if no session
     */
    public function test_otp_page_redirects_without_session()
    {
        // Try to access OTP page without pre_2fa_user_id in session
        $response = $this->get('/otp');

        $response->assertRedirect(route('login'));
    }

    /**
     * Test OTP resend functionality
     */
    public function test_otp_can_be_resent()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);
        $user->assignRole('voter');

        // Login to get to OTP step
        $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $firstOtp = $user->fresh()->currentOneTimePassword();

        // Request OTP resend
        $response = $this->post('/otp/resend');

        $response->assertStatus(200);
        $response->assertJsonStructure(['expiresAt']);

        // Verify new OTP was created
        $newOtp = $user->fresh()->currentOneTimePassword();
        $this->assertNotEquals($firstOtp->id, $newOtp->id);
    }

    /**
     * Test admin is redirected to admin dashboard after OTP verification
     */
    public function test_admin_redirected_to_admin_dashboard_after_otp()
    {
        $admin = User::factory()->create([
            'email' => 'admin@example.com',
        ]);
        $admin->assignRole('admin');

        // Login
        $this->post('/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        // Verify OTP
        $otp = $admin->fresh()->currentOneTimePassword();
        $response = $this->post('/otp', [
            'otp' => $otp->password,
        ]);

        // Should redirect to admin dashboard
        $response->assertRedirect(route('admin.dashboard'));
    }

    /**
     * Test voter is redirected to voter dashboard after OTP verification
     */
    public function test_voter_redirected_to_voter_dashboard_after_otp()
    {
        $voter = User::factory()->create([
            'email' => 'voter@example.com',
        ]);
        $voter->assignRole('voter');

        // Login
        $this->post('/login', [
            'email' => 'voter@example.com',
            'password' => 'password',
        ]);

        // Verify OTP
        $otp = $voter->fresh()->currentOneTimePassword();
        $response = $this->post('/otp', [
            'otp' => $otp->password,
        ]);

        // Should redirect to voter dashboard
        $response->assertRedirect(route('voter.dashboard'));
    }

    /**
     * Test that OTP page shows user's email
     */
    public function test_otp_page_displays_user_email()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);
        $user->assignRole('voter');

        // Login to get to OTP step
        $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        // Visit OTP page
        $response = $this->get('/otp');

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page
            ->component('Auth/OtpVerification')
            ->where('email', 'test@example.com')
            ->has('expiresAt')
        );
    }

    /**
     * Test that used OTP cannot be reused
     */
    public function test_used_otp_cannot_be_reused()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);
        $user->assignRole('voter');

        // Login
        $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $otp = $user->fresh()->currentOneTimePassword();
        $otpPassword = $otp->password;

        // Use OTP first time (should succeed)
        $this->post('/otp', [
            'otp' => $otpPassword,
        ]);

        $this->assertAuthenticated();

        // Logout
        $this->post('/logout');

        // Login again
        $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        // Try to reuse the same OTP code (should fail - new OTP generated)
        $response = $this->post('/otp', [
            'otp' => $otpPassword, // Old password
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('otp');
    }
}

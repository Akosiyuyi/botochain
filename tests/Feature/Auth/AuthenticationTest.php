<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;
use Mockery;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_can_be_rendered(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_active_user_can_login_and_redirect_to_otp(): void
    {
        // Create active user
        $user = User::factory()->create([
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);

        // Override sendOneTimePassword to prevent actual execution
        $user->sendOneTimePassword = function () {
            // no-op for testing
            return true;
        };

        // Perform login
        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        // Check session contains pre_2fa_user_id
        $this->assertEquals($user->id, session('pre_2fa_user_id'));

        // Assert redirect to OTP page
        $response->assertRedirect(route('otp', [], false));
    }


    public function test_user_cannot_login_with_wrong_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);

        // Attempt login from /login
        $response = $this->from('/login')->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        // Assert redirected back to login page
        $response->assertRedirect('/login');

        // Assert session has validation error for email
        $response->assertSessionHasErrors('email');

        // Assert user is not authenticated
        $this->assertGuest();
    }


    public function test_user_cannot_login_if_inactive(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password'),
            'is_active' => false,
        ]);

        $response = $this->from('/login')->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/login');
        $response->assertSessionHasErrors('email');

        // Assert exact error message
        $this->assertEquals(
            'This account has been deactivated. Please contact admin.',
            session('errors')->get('email')[0]
        );

        $this->assertGuest();
    }


    public function test_user_cannot_login_with_non_existing_email(): void
    {
        // Attempt login from /login with an email that doesn't exist
        $response = $this->from('/login')->post('/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password',
        ]);

        // Assert redirected back to login page
        $response->assertRedirect('/login');

        // Assert session has validation error for email
        $response->assertSessionHasErrors('email');

        // Assert user is not authenticated
        $this->assertGuest();
    }

    public function test_email_is_required(): void
    {
        $response = $this->post('/login', [
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_password_is_required(): void
    {
        $response = $this->post('/login', [
            'email' => 'test@example.com',
        ]);

        $response->assertSessionHasErrors('password');
    }

    public function test_email_must_be_valid_format(): void
    {
        $response = $this->post('/login', [
            'email' => 'not-an-email',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create([
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}

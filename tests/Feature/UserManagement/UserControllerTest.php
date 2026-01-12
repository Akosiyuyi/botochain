<?php

namespace Tests\Feature\UserManagement;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Clear Spatie cache to avoid permission issues
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'voter']);
        Role::create(['name' => 'super-admin']);

        // Create permission
        Permission::create(['name' => 'create_admin']);

        // Create an admin user and assign role & permission
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        $this->admin->givePermissionTo('create_admin');
    }

    public function test_index_displays_users_for_admin()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.users.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page
            ->component('Admin/Users/UserManagement')
            ->has('users')
            ->has('stats'));
    }

    public function test_create_form_can_be_rendered()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.users.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page
            ->component('Admin/Users/CreateAdminModal'));
    }

    public function test_user_without_permission_cannot_access_create_or_store()
    {
        $user = User::factory()->create();
        $user->assignRole('admin'); // No create_admin permission

        $response = $this->actingAs($user)->get(route('admin.users.create'));
        $response->assertStatus(403);

        $payload = [
            'name' => 'Test Admin',
            'id_number' => 10000001,
            'email' => 'testadmin@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        $response = $this->actingAs($user)->post(route('admin.users.store'), $payload);
        $response->assertStatus(403);
    }

    public function test_admin_can_be_created_successfully()
    {
        $payload = [
            'name' => 'Test Admin',
            'id_number' => 10000001,
            'email' => 'testadmin@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.users.store'), $payload);

        $response->assertRedirect(route('admin.users.index'));
        $response->assertSessionHas('success', 'Admin created successfully!');

        $this->assertDatabaseHas('users', [
            'name' => 'Test Admin',
            'id_number' => 10000001,
            'email' => 'testadmin@example.com',
        ]);

        $created = User::where('email', 'testadmin@example.com')->first();
        $this->assertTrue($created->hasRole('admin'));
        $this->assertTrue(Hash::check('password', $created->password));
    }

    public function test_cannot_create_admin_with_voter_id_number()
    {
        $payload = [
            'name' => 'Invalid Admin',
            'id_number' => 20000005, // voter range
            'email' => 'invalidadmin@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.users.store'), $payload);

        $response->assertSessionHasErrors('id_number');
        $this->assertDatabaseMissing('users', [
            'email' => 'invalidadmin@example.com',
        ]);
    }

    public function test_cannot_create_admin_with_duplicate_id_number()
    {
        $existing = User::factory()->create([
            'id_number' => 10000010,
        ]);
        $existing->assignRole('admin');

        $payload = [
            'name' => 'Another Admin',
            'id_number' => 10000010, // duplicate
            'email' => 'anotheradmin@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.users.store'), $payload);

        $response->assertSessionHasErrors('id_number');
    }

    public function test_admin_can_be_updated_successfully()
    {
        $adminToUpdate = User::factory()->create([
            'id_number' => 10000020,
            'email' => 'oldadmin@example.com',
            'name' => 'Old Admin',
        ]);
        $adminToUpdate->assignRole('admin');

        $payload = [
            'name' => 'Updated Admin',
            'id_number' => 10000021,
            'email' => 'updatedadmin@example.com',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.users.update', $adminToUpdate), $payload);

        $response->assertRedirect(route('admin.users.index'));
        $response->assertSessionHas('success', 'Admin updated successfully!');

        $this->assertDatabaseHas('users', [
            'id' => $adminToUpdate->id,
            'name' => 'Updated Admin',
            'id_number' => 10000021,
            'email' => 'updatedadmin@example.com',
        ]);
    }

    public function test_admin_update_fails_with_voter_id_number()
    {
        $adminToUpdate = User::factory()->create([
            'id_number' => 10000030,
            'email' => 'adminvotercheck@example.com',
        ]);
        $adminToUpdate->assignRole('admin');

        $payload = [
            'name' => 'Admin Invalid',
            'id_number' => 20000010, // voter range
            'email' => 'adminvotercheck@example.com',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.users.update', $adminToUpdate), $payload);

        $response->assertSessionHasErrors('id_number');
    }

    public function test_voter_can_be_updated_successfully()
    {
        // Create a voter
        $voter = User::factory()->create([
            'id_number' => 20000050,
            'email' => 'voter@example.com',
            'name' => 'Old Voter',
        ]);
        $voter->assignRole('voter');

        // Create a corresponding student record that is enrolled
        \App\Models\Student::factory()->create([
            'student_id' => 20000051,
            'name' => 'Updated Voter',
            'status' => 'Enrolled', // important!
        ]);

        $payload = [
            'name' => 'Updated Voter',
            'id_number' => 20000051, // now valid according to ValidVoterId
            'email' => 'voter@example.com',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.users.update', $voter), $payload);

        $response->assertRedirect(route('admin.users.index'));
        $response->assertSessionHas('success', 'Voter updated successfully!');

        $this->assertDatabaseHas('users', [
            'id' => $voter->id,
            'name' => 'Updated Voter',
            'id_number' => 20000051,
        ]);
    }

}

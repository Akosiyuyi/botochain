<?php

namespace Tests\Feature\Controllers\Admin;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createRoles();
        $this->seedPermissions();
    }

    private function createRoles()
    {
        // Create roles if they don't exist
        app('\Spatie\Permission\Models\Role')::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        app('\Spatie\Permission\Models\Role')::firstOrCreate(['name' => 'voter', 'guard_name' => 'web']);
        app('\Spatie\Permission\Models\Role')::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
    }

    private function seedPermissions()
    {
        // Create permission if not exists
        $permission = app('\Spatie\Permission\Models\Permission')::firstOrCreate([
            'name' => 'create_admin',
            'guard_name' => 'web',
        ]);

        // Assign to super-admin role
        $superAdminRole = app('\Spatie\Permission\Models\Role')::where('name', 'super-admin')->first();
        if ($superAdminRole && !$superAdminRole->hasPermissionTo('create_admin')) {
            $superAdminRole->givePermissionTo($permission);
        }
    }

    private function createSuperAdminUser()
    {
        $user = User::factory()->create([
            'id_number' => '10000000',
        ]);
        $user->assignRole('super-admin');
        return $user;
    }

    private function createAdminUser()
    {
        $user = User::factory()->create([
            'id_number' => '10000001',
        ]);
        $user->assignRole('admin');
        return $user;
    }

    private function createVoterUser()
    {
        $user = User::factory()->create([
            'id_number' => '20000000',
        ]);
        $user->assignRole('voter');
        return $user;
    }

    /**
     * Test admin can be created successfully
     */
    public function test_admin_can_be_created()
    {
        $superAdmin = $this->createSuperAdminUser();

        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'John Admin',
                'id_number' => '10000001',
                'email' => 'johnadmin@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertRedirect(route('admin.users.index'));
        $response->assertSessionHas('success', 'Admin created successfully!');

        $this->assertDatabaseHas('users', [
            'name' => 'John Admin',
            'id_number' => '10000001',
            'email' => 'johnadmin@example.com',
            'is_active' => true,
        ]);

        $user = User::where('email', 'johnadmin@example.com')->first();
        $this->assertTrue($user->hasRole('admin'));
    }

    /**
     * Test admin ID number cannot be in voter range (20000000-29999999)
     */
    public function test_admin_id_number_not_in_voter_range()
    {
        $superAdmin = $this->createSuperAdminUser();

        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Invalid Admin',
                'id_number' => '20000001', // Voter range
                'email' => 'invalid@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertSessionHasErrors('id_number');
        $this->assertDatabaseMissing('users', [
            'email' => 'invalid@example.com',
        ]);
    }

    /**
     * Test multiple voter range IDs are rejected
     */
    public function test_admin_cannot_have_voter_id_range()
    {
        $superAdmin = $this->createSuperAdminUser();

        // Test lower bound
        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Test Admin 1',
                'id_number' => '20000000',
                'email' => 'test1@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertSessionHasErrors('id_number');

        // Test upper bound
        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Test Admin 2',
                'id_number' => '29999999',
                'email' => 'test2@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertSessionHasErrors('id_number');

        // Test mid-range
        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Test Admin 3',
                'id_number' => '25000000',
                'email' => 'test3@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertSessionHasErrors('id_number');
    }

    /**
     * Test admin can have ID outside voter range
     */
    public function test_admin_can_have_id_outside_voter_range()
    {
        $superAdmin = $this->createSuperAdminUser();

        // Test below range
        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Admin Below Range',
                'id_number' => '10000001',
                'email' => 'below@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertRedirect(route('admin.users.index'));

        // Test above range
        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Admin Above Range',
                'id_number' => '30000001',
                'email' => 'above@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertRedirect(route('admin.users.index'));
    }

    /**
     * Test user role is assigned correctly
     */
    public function test_user_role_assignment()
    {
        $superAdmin = $this->createSuperAdminUser();

        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Role Test Admin',
                'id_number' => '10000002',
                'email' => 'roletest@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $user = User::where('email', 'roletest@example.com')->first();
        
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('admin'));
        $this->assertFalse($user->hasRole('voter'));
        $this->assertFalse($user->hasRole('super-admin'));
    }

    /**
     * Test user activation and deactivation
     */
    public function test_user_activation_deactivation()
    {
        $superAdmin = $this->createSuperAdminUser();
        $admin = $this->createAdminUser();

        // Admin should be active by default
        $this->assertEquals(1, $admin->is_active);

        // Deactivate admin
        $response = $this->actingAs($superAdmin)
            ->patch(route('admin.users.update', $admin->id), [
                'name' => $admin->name,
                'id_number' => (int) $admin->id_number,
                'email' => $admin->email,
                'is_active' => false,
            ]);

        $response->assertRedirect(route('admin.users.index'));
        
        $admin->refresh();
        $this->assertEquals(0, $admin->is_active);

        // Reactivate admin
        $response = $this->actingAs($superAdmin)
            ->patch(route('admin.users.update', $admin->id), [
                'name' => $admin->name,
                'id_number' => (int) $admin->id_number,
                'email' => $admin->email,
                'is_active' => true,
            ]);

        $admin->refresh();
        $this->assertEquals(1, $admin->is_active);
    }

    /**
     * Test unique admin name validation
     */
    public function test_unique_admin_name_validation()
    {
        $superAdmin = $this->createSuperAdminUser();

        // Create first admin
        $admin1 = User::factory()->create([
            'name' => 'Unique Admin Name',
            'id_number' => '10000003',
        ]);
        $admin1->assignRole('admin');

        // Try to create another admin with same name
        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Unique Admin Name',
                'id_number' => '10000004',
                'email' => 'another@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertSessionHasErrors('name');
        $this->assertDatabaseMissing('users', [
            'email' => 'another@example.com',
        ]);
    }

    /**
     * Test voters can have duplicate names with admins
     */
    public function test_voters_can_have_same_name_as_admins()
    {
        $superAdmin = $this->createSuperAdminUser();

        // Create admin with a name
        $admin = User::factory()->create([
            'name' => 'Shared Name',
            'id_number' => '10000005',
        ]);
        $admin->assignRole('admin');

        // Create voter with same name (should succeed)
        $voter = User::factory()->create([
            'name' => 'Shared Name',
            'id_number' => '20000001',
        ]);
        $voter->assignRole('voter');

        $this->assertDatabaseCount('users', 3); // superAdmin + admin + voter
    }

    /**
     * Test admin name is required
     */
    public function test_admin_name_is_required()
    {
        $superAdmin = $this->createSuperAdminUser();

        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => '',
                'id_number' => '10000006',
                'email' => 'noname@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertSessionHasErrors('name');
    }

    /**
     * Test admin email is required and unique
     */
    public function test_admin_email_is_required_and_unique()
    {
        $superAdmin = $this->createSuperAdminUser();

        // Test email required
        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'No Email Admin',
                'id_number' => '10000007',
                'email' => '',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertSessionHasErrors('email');

        // Create admin with email
        $admin = User::factory()->create([
            'email' => 'existing@example.com',
            'id_number' => '10000008',
        ]);
        $admin->assignRole('admin');

        // Try to create another with same email
        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Duplicate Email',
                'id_number' => '10000009',
                'email' => 'existing@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertSessionHasErrors('email');
    }

    /**
     * Test admin ID number is required and unique
     */
    public function test_admin_id_number_is_required_and_unique()
    {
        $superAdmin = $this->createSuperAdminUser();

        // Test ID required
        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'No ID Admin',
                'id_number' => '',
                'email' => 'noid@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertSessionHasErrors('id_number');

        // Create admin with ID
        $admin = User::factory()->create([
            'id_number' => '10000010',
        ]);
        $admin->assignRole('admin');

        // Try to create another with same ID
        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Duplicate ID',
                'id_number' => '10000010',
                'email' => 'dupid@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertSessionHasErrors('id_number');
    }

    /**
     * Test password is required and must be confirmed
     */
    public function test_password_is_required_and_confirmed()
    {
        $superAdmin = $this->createSuperAdminUser();

        // Test password required
        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'No Password',
                'id_number' => '10000011',
                'email' => 'nopass@example.com',
                'password' => '',
                'password_confirmation' => '',
            ]);

        $response->assertSessionHasErrors('password');

        // Test password confirmation mismatch
        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Mismatch Password',
                'id_number' => '10000012',
                'email' => 'mismatch@example.com',
                'password' => 'password123',
                'password_confirmation' => 'different456',
            ]);

        $response->assertSessionHasErrors('password');
    }

    /**
     * Test only users with create_admin permission can create admins
     */
    public function test_only_authorized_users_can_create_admin()
    {
        $admin = $this->createAdminUser();

        // Regular admin without permission should not be able to create
        $response = $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Unauthorized Create',
                'id_number' => '10000013',
                'email' => 'unauth@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertForbidden();
    }

    /**
     * Test unauthenticated user cannot create admin
     */
    public function test_unauthenticated_user_cannot_create_admin()
    {
        $response = $this->post(route('admin.users.store'), [
            'name' => 'Guest Admin',
            'id_number' => '10000014',
            'email' => 'guest@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect(route('login'));
    }

    /**
     * Test user index page loads
     */
    public function test_user_index_page_loads()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->get(route('admin.users.index'));

        $response->assertOk();
        $response->assertInertia(fn($page) => $page
            ->component('Admin/Users/UserManagement')
            ->has('users')
            ->has('stats')
        );
    }

    /**
     * Test admin update preserves role
     */
    public function test_admin_update_preserves_role()
    {
        $superAdmin = $this->createSuperAdminUser();
        $admin = $this->createAdminUser();

        $response = $this->actingAs($superAdmin)
            ->patch(route('admin.users.update', $admin->id), [
                'name' => 'Updated Admin Name',
                'id_number' => (int) $admin->id_number,
                'email' => $admin->email,
                'is_active' => true,
            ]);

        $response->assertRedirect(route('admin.users.index'));
        
        $admin->refresh();
        $this->assertEquals('Updated Admin Name', $admin->name);
        $this->assertTrue($admin->hasRole('admin'));
    }

    /**
     * Test admin can update their own name (unique constraint allows same user)
     */
    public function test_admin_can_update_own_name()
    {
        $superAdmin = $this->createSuperAdminUser();
        $admin = User::factory()->create([
            'name' => 'Original Name',
            'id_number' => '10000015',
        ]);
        $admin->assignRole('admin');

        $response = $this->actingAs($superAdmin)
            ->patch(route('admin.users.update', $admin->id), [
                'name' => 'Updated Name',
                'id_number' => $admin->id_number,
                'email' => $admin->email,
                'is_active' => true,
            ]);

        $response->assertRedirect(route('admin.users.index'));
        
        $admin->refresh();
        $this->assertEquals('Updated Name', $admin->name);
    }

    /**
     * Test voter cannot access user management
     */
    public function test_voter_cannot_access_user_management()
    {
        $voter = $this->createVoterUser();

        $response = $this->actingAs($voter)->get(route('admin.users.index'));

        $response->assertForbidden();
    }

    /**
     * Test created admin is active by default
     */
    public function test_created_admin_is_active_by_default()
    {
        $superAdmin = $this->createSuperAdminUser();

        $response = $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), [
                'name' => 'Active Admin',
                'id_number' => '10000016',
                'email' => 'active@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $user = User::where('email', 'active@example.com')->first();
        $this->assertEquals(1, $user->is_active);
    }
}

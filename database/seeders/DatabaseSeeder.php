<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */

    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            ColorThemesSeeder::class,
            SchoolLevelSeeder::class, 
            SchoolUnitSeeder::class,
        ]);

        // User::factory(10)->create();

        $admin = User::updateOrCreate(
            [
                'email' => config('app.admin_email', 'admin@yourdomain.com'),
            ],
            [
                'name' => 'System Administrator',
                'id_number' => '10000000',
                'password' => Hash::make(config('app.admin_password', 'change-me-immediately')),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        if (! $admin->hasRole('super-admin')) {
            $admin->assignRole('super-admin');
        }
    }
}

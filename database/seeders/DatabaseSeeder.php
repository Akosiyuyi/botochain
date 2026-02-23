<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
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

        User::factory()->create([
            'name' => 'System Administrator',
            'id_number' => '10000000',
            'email' => env('ADMIN_EMAIL', 'admin@yourdomain.com'),
            'password' => bcrypt(env('ADMIN_PASSWORD', 'change-me-immediately')),
            'is_active' => true,
            'email_verified_at' => now(),
        ])->assignRole('super-admin');
    }
}

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
        ]);

        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Default Admin',
            'id_number' => '1000-00000',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('password'),
            'is_active' => true,
            'email_verified_at' => now(),
        ])->assignRole('admin');
    }
}

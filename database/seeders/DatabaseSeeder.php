<?php

namespace Database\Seeders;

use App\Models\Institute;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $institute = Institute::firstOrCreate(
            ['name' => 'Tuition Suite'],
            ['type' => 'school']
        );

        $this->call(AdminUserSeeder::class);

        // Plain model call (not a factory) so seeding works in production,
        // where the dev-only fakerphp/faker package is not installed.
        User::firstOrCreate(
            ['email' => 'viewer@tuitionsuite.com'],
            [
                'institute_id' => $institute->id,
                'role' => 'user',
                'name' => 'Tuition Suite',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        (new TimetableSeeder($institute))->run();
    }
}

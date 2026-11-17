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
            ['name' => 'Demo School'],
            ['type' => 'school']
        );

        $this->call(AdminUserSeeder::class);

        User::factory()->create([
            'institute_id' => $institute->id,
            'role' => 'user',
            'name' => 'Viewer User',
            'email' => 'viewer@example.com',
        ]);

        (new TimetableSeeder($institute))->run();
    }
}

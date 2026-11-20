<?php

namespace Database\Seeders;

use App\Models\Institute;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds the system owner account. This is the only account with full
 * (super admin) rights; anyone who registers gets the read-only "user" role.
 *
 * Override the defaults with ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env.
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $institute = Institute::orderBy('id')->first();

        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@tuitionsuite.com')],
            [
                'institute_id' => $institute?->id,
                'role' => 'super_admin',
                'name' => env('ADMIN_NAME', 'Administrator'),
                'password' => env('ADMIN_PASSWORD', 'password'),
                'email_verified_at' => now(),
            ]
        );
    }
}

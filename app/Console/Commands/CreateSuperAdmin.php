<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateSuperAdmin extends Command
{
    protected $signature = 'app:create-super-admin {name} {email} {password}';

    protected $description = 'Create (or promote) a super admin account that can view every institute';

    public function handle(): int
    {
        $data = $this->arguments();

        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            $this->error($validator->errors()->first());

            return self::FAILURE;
        }

        $user = User::updateOrCreate(
            ['email' => $data['email']],
            [
                'name' => $data['name'],
                'password' => Hash::make($data['password']),
                'role' => 'super_admin',
                'institute_id' => null,
                'email_verified_at' => now(),
            ]
        );

        $this->info("Super admin ready: {$user->email}");

        return self::SUCCESS;
    }
}

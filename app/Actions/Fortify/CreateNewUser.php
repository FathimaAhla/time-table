<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\AcademicYear;
use App\Models\Institute;
use App\Models\Term;
use App\Models\User;
use Database\Seeders\InstituteDefaultsSeeder;
use Illuminate\Support\Facades\DB;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user. Every registration gets
     * its own separate school (with default week days and time slots) and is
     * its admin, so it can only ever see and manage that school's data.
     * Only the seeded super admin can see across schools.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        validator($input, [
            ...$this->profileRules(),
            'school_name' => ['nullable', 'string', 'max:255'],
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            $institute = Institute::create([
                'name' => ($input['school_name'] ?? null) ?: $input['name'].'\'s School',
                'type' => 'school',
                'email' => $input['email'],
            ]);

            InstituteDefaultsSeeder::seedFor($institute);

            $year = now()->year;
            $academicYear = AcademicYear::create([
                'institute_id' => $institute->id,
                'name' => $year.'/'.($year + 1),
                'start_date' => "$year-01-01",
                'end_date' => ($year + 1).'-12-31',
                'is_current' => true,
            ]);
            Term::create([
                'institute_id' => $institute->id,
                'academic_year_id' => $academicYear->id,
                'name' => 'Term 1',
                'start_date' => "$year-01-01",
                'end_date' => "$year-12-31",
                'is_current' => true,
            ]);

            return User::create([
                'institute_id' => $institute->id,
                'role' => 'admin',
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
            ]);
        });
    }
}

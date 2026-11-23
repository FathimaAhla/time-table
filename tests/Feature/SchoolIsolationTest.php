<?php

use App\Models\Grade;
use App\Models\Institute;
use App\Models\SchoolClass;
use App\Models\Teacher;
use App\Models\Term;
use App\Models\Timetable;
use App\Models\TimetableSession;
use App\Models\User;

function registerSchool(string $key): User
{
    test()->post(route('register.store'), [
        'name' => "Owner $key",
        'email' => "$key@example.com",
        'school_name' => "School $key",
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);
    $user = User::where('email', "$key@example.com")->first();
    test()->post(route('logout'));

    return $user;
}

test('a new school has a current term and can create, edit and delete its own data', function () {
    $a = registerSchool('a');
    $this->actingAs($a);

    expect(Term::where('is_current', true)->count())->toBe(1);

    $this->post(route('grades.store'), ['name' => '7', 'level_order' => 7])->assertSessionHasNoErrors();
    $grade = Grade::firstWhere('name', '7');
    expect($grade->institute_id)->toBe($a->institute_id);

    $this->put(route('grades.update', $grade), ['name' => '8', 'level_order' => 8, 'status' => 'active'])->assertSessionHasNoErrors();
    expect($grade->fresh()->name)->toBe('8');

    $this->delete(route('grades.destroy', $grade))->assertSessionHasNoErrors();
    expect(Grade::count())->toBe(0);
});

test('one school cannot see, edit or reference another schools data', function () {
    $a = registerSchool('a');
    $b = registerSchool('b');

    $this->actingAs($b);
    $bGrade = Grade::create(['name' => '9', 'level_order' => 9]);
    $bClass = SchoolClass::create(['grade_id' => $bGrade->id, 'name' => 'A', 'capacity' => 30, 'status' => 'active']);
    $bTeacher = Teacher::create(['employee_no' => 'T1', 'full_name' => 'B Teacher', 'max_periods_per_week' => 20, 'status' => 'active']);

    $this->actingAs($a);

    // Invisible to school A, and route-model binding can't reach it.
    expect(Grade::count())->toBe(0);
    $this->put(route('grades.update', $bGrade), ['name' => 'hacked', 'level_order' => 1, 'status' => 'active'])->assertNotFound();
    $this->delete(route('grades.destroy', $bGrade))->assertNotFound();

    // School A cannot attach its records to school B's ids.
    $this->post(route('classes.store'), [
        'grade_id' => $bGrade->id,
        'name' => 'Z',
        'capacity' => 30,
        'status' => 'active',
    ])->assertSessionHasErrors('grade_id');

    // Timetable sessions of another school are unreachable too.
    $this->actingAs($b);
    $term = Term::firstWhere('is_current', true);
    $timetable = Timetable::create(['term_id' => $term->id, 'school_class_id' => $bClass->id, 'status' => 'draft']);
    $this->actingAs($a);
    expect(TimetableSession::count())->toBe(0);
    expect(Timetable::count())->toBe(0);
});

test('the super admin can view any school and its data', function () {
    $a = registerSchool('a');
    $b = registerSchool('b');

    $this->actingAs($b);
    Grade::create(['name' => '9', 'level_order' => 9]);

    $admin = User::factory()->create(['role' => 'super_admin', 'institute_id' => null]);
    $this->actingAs($admin)->get(route('institutes.index'))->assertOk();

    $this->post(route('institutes.switch'), ['institute_id' => $b->institute_id]);
    expect(Grade::count())->toBe(1);

    $this->post(route('institutes.switch'), ['institute_id' => $a->institute_id]);
    expect(Grade::count())->toBe(0);

    expect(Institute::count())->toBe(2);
});

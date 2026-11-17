<?php

use App\Models\Institute;
use App\Models\Teacher;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->institute = Institute::create(['name' => 'Test School']);
});

test('a teacher sees their own timetable when their email matches a teacher profile', function () {
    $user = User::factory()->viewer()->create(['institute_id' => $this->institute->id, 'email' => 'amara@school.test']);
    $this->actingAs($user);
    $teacher = Teacher::create(['employee_no' => 'T-1', 'full_name' => 'Mrs. Amara Perera', 'email' => 'amara@school.test']);

    $this->get(route('timetable.mine'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('timetable/teacher-view')
            ->where('teacher.id', $teacher->id)
            ->where('isOwnTimetable', true));
});

test('a user without a teacher profile gets an explanation instead of a timetable', function () {
    $this->actingAs(User::factory()->viewer()->create(['institute_id' => $this->institute->id]));

    $this->get(route('timetable.mine'))
        ->assertInertia(fn (Assert $page) => $page->where('teacher', null));
});

test('all active teacher timetables are listed on one page', function () {
    $this->actingAs(User::factory()->create(['institute_id' => $this->institute->id]));
    Teacher::create(['employee_no' => 'T-1', 'full_name' => 'Active Teacher']);
    Teacher::create(['employee_no' => 'T-2', 'full_name' => 'Left Teacher', 'status' => 'inactive']);

    $this->get(route('timetable.teachers'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('timetable/all-teachers')
            ->has('teachers', 1)
            ->where('teachers.0.full_name', 'Active Teacher'));
});

<?php

use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Institute;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\Term;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $institute = Institute::create(['name' => 'Test School']);
    $this->actingAs(User::factory()->create(['institute_id' => $institute->id]));
    $this->grade = Grade::create(['name' => 'Grade 10', 'level_order' => 10]);
});

test('adding a class name that already exists in the grade returns a validation error instead of crashing', function () {
    SchoolClass::create(['grade_id' => $this->grade->id, 'name' => 'B']);

    $this->post(route('classes.store'), ['grade_id' => $this->grade->id, 'name' => 'B'])
        ->assertSessionHasErrors(['name' => 'This grade already has a class with that name.']);

    expect(SchoolClass::count())->toBe(1);
});

test('re-adding a removed class restores it', function () {
    $removedClass = SchoolClass::create(['grade_id' => $this->grade->id, 'name' => 'B', 'capacity' => 30]);
    $removedClass->delete();

    $this->post(route('classes.store'), ['grade_id' => $this->grade->id, 'name' => 'B', 'capacity' => 40])
        ->assertSessionHasNoErrors();

    expect(SchoolClass::count())->toBe(1)
        ->and($removedClass->fresh()->trashed())->toBeFalse()
        ->and($removedClass->fresh()->capacity)->toBe(40);
});

test('a class can be renamed to the name of a removed class', function () {
    SchoolClass::create(['grade_id' => $this->grade->id, 'name' => 'B'])->delete();
    $schoolClass = SchoolClass::create(['grade_id' => $this->grade->id, 'name' => 'C']);

    $this->put(route('classes.update', $schoolClass), [
        'grade_id' => $this->grade->id,
        'name' => 'B',
        'status' => 'active',
    ])->assertSessionHasNoErrors();

    expect($schoolClass->fresh()->name)->toBe('B');
});

test('a teacher assignment can be edited', function () {
    $year = AcademicYear::create(['name' => '2026', 'start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'is_current' => true]);
    $term = Term::create(['academic_year_id' => $year->id, 'name' => 'Term 1', 'start_date' => '2026-01-01', 'end_date' => '2026-04-30', 'is_current' => true]);
    $schoolClass = SchoolClass::create(['grade_id' => $this->grade->id, 'name' => 'A']);
    $subject = Subject::create(['name' => 'Mathematics', 'code' => 'MATH', 'type' => 'core']);
    $wrongTeacher = Teacher::create(['employee_no' => 'T1', 'full_name' => 'Wrong Teacher', 'max_periods_per_day' => 6, 'max_periods_per_week' => 30]);
    $rightTeacher = Teacher::create(['employee_no' => 'T2', 'full_name' => 'Right Teacher', 'max_periods_per_day' => 6, 'max_periods_per_week' => 30]);

    $assignment = TeacherAssignment::create([
        'term_id' => $term->id,
        'school_class_id' => $schoolClass->id,
        'subject_id' => $subject->id,
        'teacher_id' => $wrongTeacher->id,
        'weekly_periods' => 4,
    ]);

    $this->put(route('assignments.update', $assignment), [
        'school_class_id' => $schoolClass->id,
        'subject_id' => $subject->id,
        'teacher_id' => $rightTeacher->id,
        'weekly_periods' => 6,
    ])->assertSessionHasNoErrors();

    expect($assignment->fresh())
        ->teacher_id->toBe($rightTeacher->id)
        ->weekly_periods->toBe(6);
});

test('the dashboard shows school statistics', function () {
    SchoolClass::create(['grade_id' => $this->grade->id, 'name' => 'A']);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('counts.classes', 1)
            ->where('counts.grades', 1)
            ->where('timetableHealth.missing', 1));
});

test('anyone can open the timetable playground', function () {
    auth()->logout();

    $this->get(route('playground'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('playground'));
});

<?php

use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\Institute;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\Term;
use App\Models\User;

beforeEach(function () {
    $this->institute = Institute::create(['name' => 'Test School']);
});

test('read-only users can view pages but cannot change data', function () {
    $this->actingAs(User::factory()->viewer()->create(['institute_id' => $this->institute->id]));

    $this->get(route('classes.index'))->assertOk();

    $this->post(route('grades.store'), ['name' => '1'])->assertForbidden();
    expect(Grade::count())->toBe(0);
});

test('a classroom can only be assigned to one class', function () {
    $this->actingAs(User::factory()->create(['institute_id' => $this->institute->id]));
    $grade = Grade::create(['name' => '1', 'level_order' => 1]);
    $classroom = Classroom::factory()->create();
    SchoolClass::create(['grade_id' => $grade->id, 'name' => 'A', 'classroom_id' => $classroom->id]);

    $this->post(route('classes.store'), ['grade_id' => $grade->id, 'name' => 'B', 'classroom_id' => $classroom->id])
        ->assertSessionHasErrors(['classroom_id' => 'That classroom is already assigned to another class.']);
});

test('the class teacher first period is only reserved when the toggle is on', function (bool $firstPeriod, int $expectedAssignments) {
    $this->actingAs(User::factory()->create(['institute_id' => $this->institute->id]));
    $year = AcademicYear::create(['name' => '2026', 'start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'is_current' => true]);
    Term::create(['academic_year_id' => $year->id, 'name' => 'Term 1', 'start_date' => '2026-01-01', 'end_date' => '2026-04-30', 'is_current' => true]);
    $grade = Grade::create(['name' => '1', 'level_order' => 1]);
    $subject = Subject::create(['name' => 'Mathematics', 'code' => 'MATH', 'type' => 'core']);
    $subject->grades()->attach($grade->id, ['weekly_periods' => 5]);
    $teacher = Teacher::create(['employee_no' => 'T-1', 'full_name' => 'Ms. Silva', 'max_periods_per_day' => 6, 'max_periods_per_week' => 30]);
    $teacher->subjects()->attach($subject->id);

    $this->post(route('classes.store'), [
        'grade_id' => $grade->id,
        'name' => 'A',
        'class_teacher_id' => $teacher->id,
        'class_teacher_first_period' => $firstPeriod,
    ])->assertSessionHasNoErrors();

    expect(SchoolClass::first()->class_teacher_first_period)->toBe($firstPeriod)
        ->and(TeacherAssignment::count())->toBe($expectedAssignments);
})->with([
    'toggle on' => [true, 1],
    'toggle off' => [false, 0],
]);

<?php

use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\SchoolClassController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherAssignmentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TimeSlotController;
use App\Http\Controllers\TimetableController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'can_manage'])->group(function () {
    Route::get('academics/grades', [GradeController::class, 'index'])->name('grades.index');
    Route::post('academics/grades', [GradeController::class, 'store'])->name('grades.store');
    Route::put('academics/grades/{grade}', [GradeController::class, 'update'])->name('grades.update');
    Route::delete('academics/grades/{grade}', [GradeController::class, 'destroy'])->name('grades.destroy');

    Route::get('academics/classes', [SchoolClassController::class, 'index'])->name('classes.index');
    Route::post('academics/classes', [SchoolClassController::class, 'store'])->name('classes.store');
    Route::put('academics/classes/{schoolClass}', [SchoolClassController::class, 'update'])->name('classes.update');
    Route::delete('academics/classes/{schoolClass}', [SchoolClassController::class, 'destroy'])->name('classes.destroy');

    Route::get('academics/classrooms', [ClassroomController::class, 'index'])->name('classrooms.index');
    Route::post('academics/classrooms', [ClassroomController::class, 'store'])->name('classrooms.store');
    Route::put('academics/classrooms/{classroom}', [ClassroomController::class, 'update'])->name('classrooms.update');
    Route::delete('academics/classrooms/{classroom}', [ClassroomController::class, 'destroy'])->name('classrooms.destroy');

    Route::get('academics/subjects', [SubjectController::class, 'index'])->name('subjects.index');
    Route::post('academics/subjects', [SubjectController::class, 'store'])->name('subjects.store');
    Route::put('academics/subjects/{subject}', [SubjectController::class, 'update'])->name('subjects.update');
    Route::delete('academics/subjects/{subject}', [SubjectController::class, 'destroy'])->name('subjects.destroy');

    Route::get('teachers', [TeacherController::class, 'index'])->name('teachers.index');
    Route::post('teachers', [TeacherController::class, 'store'])->name('teachers.store');
    Route::put('teachers/{teacher}', [TeacherController::class, 'update'])->name('teachers.update');
    Route::delete('teachers/{teacher}', [TeacherController::class, 'destroy'])->name('teachers.destroy');

    Route::get('teachers-assignments', [TeacherAssignmentController::class, 'index'])->name('assignments.index');
    Route::post('teachers-assignments', [TeacherAssignmentController::class, 'store'])->name('assignments.store');
    Route::put('teachers-assignments/{teacherAssignment}', [TeacherAssignmentController::class, 'update'])->name('assignments.update');
    Route::delete('teachers-assignments/{teacherAssignment}', [TeacherAssignmentController::class, 'destroy'])->name('assignments.destroy');

    Route::get('timetable/time-slots', [TimeSlotController::class, 'index'])->name('time-slots.index');
    Route::post('timetable/time-slots', [TimeSlotController::class, 'store'])->name('time-slots.store');
    Route::put('timetable/time-slots/{timeSlot}', [TimeSlotController::class, 'update'])->name('time-slots.update');
    Route::delete('timetable/time-slots/{timeSlot}', [TimeSlotController::class, 'destroy'])->name('time-slots.destroy');

    Route::get('timetable', [TimetableController::class, 'index'])->name('timetable.index');
    Route::get('timetable/class/{schoolClass}', [TimetableController::class, 'show'])->name('timetable.class');
    Route::get('timetable/teachers', [TimetableController::class, 'teachers'])->name('timetable.teachers');
    Route::get('my-timetable', [TimetableController::class, 'mine'])->name('timetable.mine');
    Route::get('timetable/teacher/{teacher}', [TimetableController::class, 'teacher'])->name('timetable.teacher');
    Route::post('timetable/class/{schoolClass}/generate', [TimetableController::class, 'generate'])->name('timetable.generate');
    Route::post('timetable/generate-all', [TimetableController::class, 'generateAll'])->name('timetable.generate-all');
    Route::post('timetable/class/{schoolClass}/sync', [TimetableController::class, 'sync'])->name('timetable.sync');
    Route::post('timetable/move', [TimetableController::class, 'move'])->name('timetable.move');
    Route::post('timetable/swap', [TimetableController::class, 'swap'])->name('timetable.swap');
    Route::post('timetable/session/{timetableSession}/toggle-lock', [TimetableController::class, 'toggleLock'])->name('timetable.toggle-lock');
});

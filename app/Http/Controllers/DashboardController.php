<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\Term;
use App\Models\TimeSlot;
use App\Models\Timetable;
use App\Models\WeekDay;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $term = Term::where('is_current', true)->first();

        $activeClasses = SchoolClass::with('grade')->where('status', 'active')->orderBy('grade_id')->orderBy('name')->get();

        $timetables = $term
            ? Timetable::where('term_id', $term->id)->get(['id', 'school_class_id', 'status', 'is_out_of_sync'])
            : collect();

        $classesWithTimetable = $timetables->pluck('school_class_id')->unique();

        $assignedPeriodsByTeacher = $term
            ? TeacherAssignment::where('term_id', $term->id)
                ->where('status', 'active')
                ->selectRaw('teacher_id, SUM(weekly_periods) as periods, COUNT(*) as assignments')
                ->groupBy('teacher_id')
                ->get()
                ->keyBy('teacher_id')
            : collect();

        $teacherWorkload = Teacher::where('status', 'active')
            ->orderBy('full_name')
            ->get(['id', 'full_name', 'max_periods_per_week'])
            ->map(fn (Teacher $teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->full_name,
                'assigned' => (int) ($assignedPeriodsByTeacher->get($teacher->id)?->periods ?? 0),
                'assignments' => (int) ($assignedPeriodsByTeacher->get($teacher->id)?->assignments ?? 0),
                'max' => $teacher->max_periods_per_week,
            ])
            ->sortByDesc('assigned')
            ->values();

        $counts = [
            'grades' => Grade::where('status', 'active')->count(),
            'classes' => $activeClasses->count(),
            'subjects' => Subject::where('status', 'active')->count(),
            'teachers' => $teacherWorkload->count(),
            'assignments' => $term ? TeacherAssignment::where('term_id', $term->id)->count() : 0,
            'timeSlots' => TimeSlot::count(),
            'teachingPeriods' => TimeSlot::where('slot_type', 'period')->count(),
            'schoolDays' => WeekDay::where('is_school_day', true)->count(),
        ];

        return Inertia::render('dashboard', [
            'term' => $term,
            'counts' => $counts,
            'timetableHealth' => [
                'generated' => $classesWithTimetable->count(),
                'published' => $timetables->where('status', 'published')->count(),
                'outOfSync' => $timetables->where('is_out_of_sync', true)->count(),
                'missing' => $activeClasses->whereNotIn('id', $classesWithTimetable)->count(),
            ],
            'classesWithoutTimetable' => $activeClasses
                ->whereNotIn('id', $classesWithTimetable)
                ->take(8)
                ->map(fn (SchoolClass $schoolClass) => [
                    'id' => $schoolClass->id,
                    'name' => ($schoolClass->grade?->name ?? '').$schoolClass->name,
                ])
                ->values(),
            'classesWithoutTeacher' => $activeClasses->whereNull('class_teacher_id')->count(),
            'teacherWorkload' => $teacherWorkload->take(8),
            'overloadedTeachers' => $teacherWorkload->filter(fn (array $teacher) => $teacher['assigned'] > $teacher['max'])->count(),
            'idleTeachers' => $teacherWorkload->where('assigned', 0)->count(),
        ]);
    }
}

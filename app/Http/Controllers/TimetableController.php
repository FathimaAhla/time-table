<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Term;
use App\Models\TimeSlot;
use App\Models\Timetable;
use App\Models\TimetableSession;
use App\Models\WeekDay;
use App\Services\TimetableGenerator;
use App\Support\InstituteContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimetableController extends Controller
{
    public function index(Request $request): Response
    {
        $term = Term::where('is_current', true)->first();
        $weekDays = WeekDay::where('is_school_day', true)->orderBy('sort_order')->get();
        $timeSlots = TimeSlot::orderBy('sort_order')->get();

        $classesQuery = SchoolClass::with(['grade', 'timetables' => function ($q) use ($term) {
            $q->when($term, fn ($qq) => $qq->where('term_id', $term->id));
        }])->where('status', 'active');

        if ($request->filled('grade_id')) {
            $classesQuery->where('grade_id', $request->integer('grade_id'));
        }
        if ($request->filled('school_class_id')) {
            $classesQuery->where('id', $request->integer('school_class_id'));
        }

        $classes = $classesQuery->orderBy('grade_id')->orderBy('name')->get();

        $timetableIds = $classes->flatMap(fn ($c) => $c->timetables->pluck('id'));

        $sessions = TimetableSession::with(['subject', 'teacher'])
            ->whereIn('timetable_id', $timetableIds)
            ->when($request->filled('teacher_id'), fn ($q) => $q->where('teacher_id', $request->integer('teacher_id')))
            ->when($request->filled('subject_id'), fn ($q) => $q->where('subject_id', $request->integer('subject_id')))
            ->get();

        return Inertia::render('timetable/master', [
            'term' => $term,
            'weekDays' => $weekDays,
            'timeSlots' => $timeSlots,
            'classes' => $classes,
            'sessions' => $sessions,
            'grades' => Grade::where('status', 'active')->orderBy('level_order')->get(),
            'teachers' => Teacher::where('status', 'active')->orderBy('full_name')->get(['id', 'full_name']),
            'subjects' => Subject::where('status', 'active')->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['grade_id', 'school_class_id', 'teacher_id', 'subject_id']),
        ]);
    }

    public function show(SchoolClass $schoolClass): Response
    {
        $term = Term::where('is_current', true)->first();

        $timetable = $term
            ? Timetable::firstOrCreate(['term_id' => $term->id, 'school_class_id' => $schoolClass->id], ['status' => 'draft'])
            : null;

        $sessions = $timetable
            ? TimetableSession::with(['subject', 'teacher'])->where('timetable_id', $timetable->id)->get()
            : collect();

        $pendingAssignments = $term
            ? $schoolClass->teacherAssignments()
                ->with(['subject', 'teacher'])
                ->where('term_id', $term->id)
                ->where('status', 'active')
                ->where('sync_status', '!=', 'synced')
                ->get()
            : collect();

        return Inertia::render('timetable/class-view', [
            'term' => $term,
            'schoolClass' => $schoolClass->load('grade'),
            'timetable' => $timetable,
            'weekDays' => WeekDay::where('is_school_day', true)->orderBy('sort_order')->get(),
            'timeSlots' => TimeSlot::orderBy('sort_order')->get(),
            'sessions' => $sessions,
            'pendingAssignments' => $pendingAssignments,
        ]);
    }

    public function teacher(Teacher $teacher): Response
    {
        return $this->renderTeacherTimetable($teacher);
    }

    /**
     * The signed-in user's own timetable, matched to a teacher by email.
     */
    public function mine(Request $request): Response
    {
        $teacher = Teacher::where('email', $request->user()->email)->first();

        if (! $teacher) {
            return Inertia::render('timetable/teacher-view', [
                'term' => null,
                'teacher' => null,
                'weekDays' => [],
                'timeSlots' => [],
                'sessions' => [],
                'isOwnTimetable' => true,
            ]);
        }

        return $this->renderTeacherTimetable($teacher, isOwnTimetable: true);
    }

    /**
     * Every active teacher's timetable on one page, for printing / one PDF.
     */
    public function teachers(): Response
    {
        $term = Term::where('is_current', true)->first();

        $teachers = Teacher::with('subjects:id,name')
            ->where('status', 'active')
            ->orderBy('full_name')
            ->get();

        $sessions = $term
            ? TimetableSession::with(['subject:id,name', 'timetable.schoolClass.grade:id,name'])
                ->whereIn('teacher_id', $teachers->pluck('id'))
                ->whereHas('timetable', fn ($q) => $q->where('term_id', $term->id))
                ->get()
            : collect();

        return Inertia::render('timetable/all-teachers', [
            'term' => $term,
            'teachers' => $teachers,
            'weekDays' => WeekDay::where('is_school_day', true)->orderBy('sort_order')->get(),
            'timeSlots' => TimeSlot::orderBy('sort_order')->get(),
            'sessions' => $sessions,
        ]);
    }

    private function renderTeacherTimetable(Teacher $teacher, bool $isOwnTimetable = false): Response
    {
        $term = Term::where('is_current', true)->first();

        $sessions = $term
            ? TimetableSession::with(['subject', 'timetable.schoolClass.grade'])
                ->where('teacher_id', $teacher->id)
                ->whereHas('timetable', fn ($q) => $q->where('term_id', $term->id))
                ->get()
            : collect();

        return Inertia::render('timetable/teacher-view', [
            'term' => $term,
            'teacher' => $teacher->load('subjects:id,name'),
            'weekDays' => WeekDay::where('is_school_day', true)->orderBy('sort_order')->get(),
            'timeSlots' => TimeSlot::orderBy('sort_order')->get(),
            'sessions' => $sessions,
            'isOwnTimetable' => $isOwnTimetable,
        ]);
    }

    public function generate(Request $request, SchoolClass $schoolClass, TimetableGenerator $generator): RedirectResponse
    {
        $term = Term::where('is_current', true)->firstOrFail();

        $generator->regenerate($term->id, $schoolClass->id, $request->user()?->id);

        return back()->with('success', 'Timetable regenerated for '.$schoolClass->displayName().'.');
    }

    public function generateAll(Request $request, TimetableGenerator $generator): RedirectResponse
    {
        $term = Term::where('is_current', true)->firstOrFail();

        foreach (SchoolClass::where('status', 'active')->get() as $schoolClass) {
            $generator->regenerate($term->id, $schoolClass->id, $request->user()?->id);
        }

        return back()->with('success', 'Timetable generated for all classes.');
    }

    public function sync(Request $request, SchoolClass $schoolClass, TimetableGenerator $generator): RedirectResponse
    {
        $term = Term::where('is_current', true)->firstOrFail();

        $generator->sync($term->id, $schoolClass->id, $request->user()?->id);

        return back()->with('success', 'Timetable synced with the latest teacher assignments.');
    }

    public function move(Request $request, TimetableGenerator $generator): RedirectResponse
    {
        $data = $request->validate([
            'session_id' => 'required|exists:timetable_sessions,id',
            'week_day_id' => ['required', InstituteContext::exists('week_days')],
            'time_slot_id' => ['required', InstituteContext::exists('time_slots')],
        ]);

        $session = TimetableSession::findOrFail($data['session_id']);
        $error = $generator->moveSession($session, $data['week_day_id'], $data['time_slot_id'], $request->user()?->id);

        return $error ? back()->with('error', $error) : back()->with('success', 'Period moved.');
    }

    public function swap(Request $request, TimetableGenerator $generator): RedirectResponse
    {
        $data = $request->validate([
            'session_id_a' => 'required|exists:timetable_sessions,id',
            'session_id_b' => 'required|exists:timetable_sessions,id',
        ]);

        $a = TimetableSession::findOrFail($data['session_id_a']);
        $b = TimetableSession::findOrFail($data['session_id_b']);
        $error = $generator->swapSessions($a, $b, $request->user()?->id);

        return $error ? back()->with('error', $error) : back()->with('success', 'Periods swapped.');
    }

    public function toggleLock(TimetableSession $timetableSession): RedirectResponse
    {
        $timetableSession->update(['is_locked' => ! $timetableSession->is_locked]);

        return back()->with('success', $timetableSession->is_locked ? 'Period locked.' : 'Period unlocked.');
    }
}

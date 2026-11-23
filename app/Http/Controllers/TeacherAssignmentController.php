<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\Term;
use App\Support\InstituteContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAssignmentController extends Controller
{
    public function index(): Response
    {
        $term = Term::where('is_current', true)->first();

        $assignments = $term
            ? TeacherAssignment::with(['schoolClass.grade', 'subject', 'teacher'])
                ->where('term_id', $term->id)
                ->get()
            : collect();

        return Inertia::render('teachers/assignments', [
            'term' => $term,
            'assignments' => $assignments,
            'classes' => SchoolClass::with('grade')->where('status', 'active')->get(),
            'subjects' => Subject::where('status', 'active')->orderBy('name')->get(),
            'teachers' => Teacher::with('subjects')->where('status', 'active')->orderBy('full_name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'term_id' => ['required', InstituteContext::exists('terms')],
            'school_class_id' => ['required', InstituteContext::exists('school_classes')],
            'subject_id' => ['required', InstituteContext::exists('subjects')],
            'teacher_id' => ['required', InstituteContext::exists('teachers')],
            'weekly_periods' => 'required|integer|min:1|max:20',
        ]);

        TeacherAssignment::updateOrCreate(
            [
                'term_id' => $data['term_id'],
                'school_class_id' => $data['school_class_id'],
                'subject_id' => $data['subject_id'],
            ],
            [
                'teacher_id' => $data['teacher_id'],
                'weekly_periods' => $data['weekly_periods'],
                'status' => 'active',
            ]
        );

        return back()->with('success', 'Teacher assigned to class/subject.');
    }

    public function update(Request $request, TeacherAssignment $teacherAssignment): RedirectResponse
    {
        $data = $request->validate([
            'school_class_id' => ['required', InstituteContext::exists('school_classes')],
            'subject_id' => [
                'required',
                InstituteContext::exists('subjects'),
                Rule::unique('teacher_assignments')
                    ->where('term_id', $teacherAssignment->term_id)
                    ->where('school_class_id', $request->input('school_class_id'))
                    ->ignore($teacherAssignment->id),
            ],
            'teacher_id' => ['required', InstituteContext::exists('teachers')],
            'weekly_periods' => 'required|integer|min:1|max:20',
        ], ['subject_id.unique' => 'This class already has a teacher assigned for that subject.']);

        if ((int) $data['school_class_id'] !== $teacherAssignment->school_class_id) {
            $teacherAssignment->flagTimetableOutOfSync();
        }

        $teacherAssignment->update($data);

        return back()->with('success', 'Assignment updated. Related timetable flagged for review.');
    }

    public function destroy(TeacherAssignment $teacherAssignment): RedirectResponse
    {
        $teacherAssignment->flagTimetableOutOfSync();
        $teacherAssignment->delete();

        return back()->with('success', 'Assignment removed. Related timetable flagged for review.');
    }
}

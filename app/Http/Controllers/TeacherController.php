<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Teacher;
use App\Support\InstituteContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('teachers/index', [
            'teachers' => Teacher::with('subjects')->orderBy('full_name')->get(),
            'subjects' => Subject::where('status', 'active')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'employee_no' => ['required', 'string', 'max:30', Rule::unique('teachers')->where('institute_id', InstituteContext::id())->whereNull('deleted_at')],
            'full_name' => 'required|string|max:150',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'qualification' => 'nullable|string|max:150',
            'max_periods_per_day' => 'required|integer|min:1|max:12',
            'max_periods_per_week' => 'required|integer|min:1|max:60',
            'subject_ids' => 'array',
            'subject_ids.*' => 'exists:subjects,id',
        ]);

        $teacher = Teacher::onlyTrashed()->where('employee_no', $data['employee_no'])->first();

        if ($teacher) {
            $teacher->restore();
            $teacher->update([...$data, 'status' => 'active']);
        } else {
            $teacher = Teacher::create($data);
        }
        $teacher->subjects()->sync($data['subject_ids'] ?? []);

        return back()->with('success', 'Teacher created.');
    }

    public function update(Request $request, Teacher $teacher): RedirectResponse
    {
        $data = $request->validate([
            'employee_no' => ['required', 'string', 'max:30', Rule::unique('teachers')->where('institute_id', InstituteContext::id())->whereNull('deleted_at')->ignore($teacher->id)],
            'full_name' => 'required|string|max:150',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'qualification' => 'nullable|string|max:150',
            'max_periods_per_day' => 'required|integer|min:1|max:12',
            'max_periods_per_week' => 'required|integer|min:1|max:60',
            'status' => 'required|in:active,inactive',
            'subject_ids' => 'array',
            'subject_ids.*' => 'exists:subjects,id',
        ]);

        Teacher::onlyTrashed()->where('employee_no', $data['employee_no'])
            ->each(fn (Teacher $removedTeacher) => $removedTeacher->forceFill([
                'employee_no' => mb_substr('~'.$removedTeacher->id.'-'.$removedTeacher->employee_no, 0, 30),
            ])->saveQuietly());

        $teacher->update($data);
        $teacher->subjects()->sync($data['subject_ids'] ?? []);

        return back()->with('success', 'Teacher updated.');
    }

    public function destroy(Teacher $teacher): RedirectResponse
    {
        $teacher->delete();

        return back()->with('success', 'Teacher removed.');
    }
}

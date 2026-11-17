<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Teacher;
use App\Services\TimetableGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;
use Inertia\Inertia;
use Inertia\Response;

class SchoolClassController extends Controller
{
    public function index(): Response
    {
        $classes = SchoolClass::with(['grade', 'classTeacher', 'classroom'])
            ->orderBy('grade_id')->orderBy('name')->get();

        return Inertia::render('academics/classes/index', [
            'classes' => $classes,
            'grades' => Grade::where('status', 'active')->orderBy('level_order')->get(),
            'teachers' => Teacher::where('status', 'active')->orderBy('full_name')->get(['id', 'full_name']),
            'classrooms' => Classroom::where('status', 'active')->orderBy('name')->get(['id', 'name', 'building', 'capacity']),
        ]);
    }

    public function store(Request $request, TimetableGenerator $generator): RedirectResponse
    {
        $data = $request->validate([
            'grade_id' => 'required|exists:grades,id',
            'name' => ['required', 'string', 'max:50', $this->uniqueNameInGrade($request)],
            'capacity' => 'nullable|integer|min:1',
            'classroom_id' => ['nullable', 'exists:classrooms,id', $this->classroomNotTaken()],
            'class_teacher_id' => 'nullable|exists:teachers,id',
            'class_teacher_first_period' => 'boolean',
        ], $this->messages());

        $removedClass = SchoolClass::onlyTrashed()
            ->where('grade_id', $data['grade_id'])
            ->where('name', $data['name'])
            ->first();

        if ($removedClass) {
            $removedClass->restore();
            $removedClass->update([...$data, 'status' => 'active']);
            $schoolClass = $removedClass;
        } else {
            $schoolClass = SchoolClass::create($data);
        }

        $warning = $generator->applyClassTeacherSubject($schoolClass, $request->user()?->id);

        return back()->with($warning ? 'error' : 'success', $warning ?? 'Class created.');
    }

    public function update(Request $request, SchoolClass $schoolClass, TimetableGenerator $generator): RedirectResponse
    {
        $data = $request->validate([
            'grade_id' => 'required|exists:grades,id',
            'name' => ['required', 'string', 'max:50', $this->uniqueNameInGrade($request)->ignore($schoolClass->id)],
            'capacity' => 'nullable|integer|min:1',
            'classroom_id' => ['nullable', 'exists:classrooms,id', $this->classroomNotTaken()->ignore($schoolClass->id)],
            'class_teacher_id' => 'nullable|exists:teachers,id',
            'class_teacher_first_period' => 'boolean',
            'status' => 'required|in:active,inactive',
        ], $this->messages());

        SchoolClass::onlyTrashed()
            ->where('grade_id', $data['grade_id'])
            ->where('name', $data['name'])
            ->each(fn (SchoolClass $removedClass) => $removedClass->forceFill([
                'name' => $removedClass->name.'~removed-'.$removedClass->id,
            ])->saveQuietly());

        $schoolClass->update($data);

        $warning = $schoolClass->wasChanged(['class_teacher_id', 'class_teacher_first_period'])
            ? $generator->applyClassTeacherSubject($schoolClass, $request->user()?->id)
            : null;

        return back()->with($warning ? 'error' : 'success', $warning ?? 'Class updated.');
    }

    public function destroy(SchoolClass $schoolClass): RedirectResponse
    {
        $schoolClass->delete();

        return back()->with('success', 'Class removed.');
    }

    /**
     * A class name must be unique within its grade, ignoring removed classes
     * (those are restored or renamed out of the way instead).
     */
    private function uniqueNameInGrade(Request $request): Unique
    {
        return Rule::unique('school_classes', 'name')
            ->where('grade_id', $request->input('grade_id'))
            ->whereNull('deleted_at');
    }

    /**
     * A classroom (physical room) can house only one class at a time.
     */
    private function classroomNotTaken(): Unique
    {
        return Rule::unique('school_classes', 'classroom_id')->whereNull('deleted_at');
    }

    /**
     * @return array<string, string>
     */
    private function messages(): array
    {
        return [
            'name.unique' => 'This grade already has a class with that name.',
            'classroom_id.unique' => 'That classroom is already assigned to another class.',
        ];
    }
}

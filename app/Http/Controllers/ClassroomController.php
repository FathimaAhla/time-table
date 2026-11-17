<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Support\InstituteContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('academics/classrooms/index', [
            'classrooms' => Classroom::with('schoolClass.grade:id,name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Classroom::create($this->validated($request));

        return back()->with('success', 'Classroom created.');
    }

    public function update(Request $request, Classroom $classroom): RedirectResponse
    {
        $classroom->update($this->validated($request, $classroom));

        return back()->with('success', 'Classroom updated.');
    }

    public function destroy(Classroom $classroom): RedirectResponse
    {
        $classroom->schoolClass()->update(['classroom_id' => null]);
        $classroom->delete();

        return back()->with('success', 'Classroom removed.');
    }

    /**
     * @return array{name: string, building: string|null, capacity: int, status?: string}
     */
    private function validated(Request $request, ?Classroom $classroom = null): array
    {
        $uniqueName = $this->uniqueName();

        return $request->validate([
            'name' => ['required', 'string', 'max:50', $classroom ? $uniqueName->ignore($classroom->id) : $uniqueName],
            'building' => 'nullable|string|max:100',
            'capacity' => 'required|integer|min:1|max:500',
            'status' => [$classroom ? 'required' : 'sometimes', 'in:active,inactive'],
        ], ['name.unique' => 'A classroom with this name already exists.']);
    }

    private function uniqueName(): Unique
    {
        return Rule::unique('classrooms', 'name')
            ->where('institute_id', InstituteContext::id())
            ->whereNull('deleted_at');
    }
}

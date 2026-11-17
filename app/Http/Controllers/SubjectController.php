<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Support\InstituteContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('academics/subjects/index', [
            'subjects' => Subject::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'code' => ['required', 'string', 'max:20', Rule::unique('subjects')->where('institute_id', InstituteContext::id())->whereNull('deleted_at')],
            'type' => 'required|in:core,elective',
            'color_hex' => 'nullable|string|max:7',
        ]);

        $removedSubject = Subject::onlyTrashed()->where('code', $data['code'])->first();

        if ($removedSubject) {
            $removedSubject->restore();
            $removedSubject->update([...$data, 'status' => 'active']);
        } else {
            Subject::create($data);
        }

        return back()->with('success', 'Subject created.');
    }

    public function update(Request $request, Subject $subject): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'code' => ['required', 'string', 'max:20', Rule::unique('subjects')->where('institute_id', InstituteContext::id())->whereNull('deleted_at')->ignore($subject->id)],
            'type' => 'required|in:core,elective',
            'color_hex' => 'nullable|string|max:7',
            'status' => 'required|in:active,inactive',
        ]);

        Subject::onlyTrashed()->where('code', $data['code'])
            ->each(fn (Subject $removedSubject) => $removedSubject->forceFill([
                'code' => mb_substr('~'.$removedSubject->id.'-'.$removedSubject->code, 0, 20),
            ])->saveQuietly());

        $subject->update($data);

        return back()->with('success', 'Subject updated.');
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        $subject->delete();

        return back()->with('success', 'Subject removed.');
    }
}

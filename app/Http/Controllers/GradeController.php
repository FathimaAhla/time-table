<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GradeController extends Controller
{
    public function index(): Response
    {
        $grades = Grade::withCount('classes')->orderBy('level_order')->get();

        return Inertia::render('academics/grades/index', ['grades' => $grades]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:50',
            'level_order' => 'nullable|integer',
        ]);

        Grade::create([...$data, 'level_order' => $data['level_order'] ?? (int) $data['name']]);

        return back()->with('success', 'Grade created.');
    }

    public function update(Request $request, Grade $grade): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:50',
            'level_order' => 'required|integer',
            'status' => 'required|in:active,inactive',
        ]);

        $grade->update($data);

        return back()->with('success', 'Grade updated.');
    }

    public function destroy(Grade $grade): RedirectResponse
    {
        $grade->delete();

        return back()->with('success', 'Grade removed.');
    }
}

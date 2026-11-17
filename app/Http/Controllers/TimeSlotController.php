<?php

namespace App\Http\Controllers;

use App\Models\TimeSlot;
use App\Models\WeekDay;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimeSlotController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('timetable/time-slots', [
            'timeSlots' => TimeSlot::orderBy('sort_order')->get(),
            'weekDays' => WeekDay::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:50',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'sort_order' => 'required|integer',
            'slot_type' => 'required|in:period,fixed',
            'fixed_activity_name' => 'nullable|string|max:100|required_if:slot_type,fixed',
        ]);

        TimeSlot::create($data);

        return back()->with('success', 'Time slot created.');
    }

    public function update(Request $request, TimeSlot $timeSlot): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:50',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'sort_order' => 'required|integer',
            'slot_type' => 'required|in:period,fixed',
            'fixed_activity_name' => 'nullable|string|max:100|required_if:slot_type,fixed',
        ]);

        $timeSlot->update($data);

        return back()->with('success', 'Time slot updated.');
    }

    public function destroy(TimeSlot $timeSlot): RedirectResponse
    {
        $timeSlot->delete();

        return back()->with('success', 'Time slot removed.');
    }
}

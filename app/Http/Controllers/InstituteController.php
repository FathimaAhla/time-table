<?php

namespace App\Http\Controllers;

use App\Models\Institute;
use App\Support\InstituteContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InstituteController extends Controller
{
    /**
     * Super-admin only: list every school/tuition/institute registered on
     * the system, with the one currently being "viewed as" highlighted.
     */
    public function index(): Response
    {
        $institutes = Institute::withCount('users')->orderBy('name')->get();

        return Inertia::render('institutes/index', [
            'institutes' => $institutes,
            'viewingInstituteId' => InstituteContext::id(),
        ]);
    }

    public function switch(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'institute_id' => 'nullable|exists:institutes,id',
        ]);

        InstituteContext::setViewing($data['institute_id'] ?? null);

        return back()->with('success', $data['institute_id']
            ? 'Now viewing: '.Institute::find($data['institute_id'])->name
            : 'Viewing all institutes.');
    }
}

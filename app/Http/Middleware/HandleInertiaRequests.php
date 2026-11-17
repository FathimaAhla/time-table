<?php

namespace App\Http\Middleware;

use App\Models\Institute;
use App\Models\Teacher;
use App\Support\InstituteContext;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'currentInstitute' => $user ? InstituteContext::current() : null,
            'isSuperAdmin' => $user?->isSuperAdmin() ?? false,
            'canManage' => $user?->canManage() ?? false,
            'isTeacher' => fn () => $user !== null && Teacher::where('email', $user->email)->exists(),
            'switchableInstitutes' => $user?->isSuperAdmin()
                ? Institute::orderBy('name')->get(['id', 'name', 'type'])
                : null,
        ];
    }
}

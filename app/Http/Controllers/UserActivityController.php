<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserActivityController extends Controller
{
    /**
     * Super-admin only: who has registered, which school they own,
     * how often they log in and who is online right now.
     */
    public function index(): Response
    {
        $onlineIds = DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', now()->subMinutes(5)->getTimestamp())
            ->pluck('user_id')
            ->unique();

        $users = User::with('institute:id,name')
            ->orderByDesc('last_login_at')
            ->get(['id', 'institute_id', 'role', 'name', 'email', 'last_login_at', 'login_count', 'created_at'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'school' => $user->institute?->name,
                'last_login_at' => $user->last_login_at?->toIso8601String(),
                'login_count' => $user->login_count,
                'registered_at' => $user->created_at?->toIso8601String(),
                'online' => $onlineIds->contains($user->id),
            ]);

        return Inertia::render('users/index', [
            'users' => $users,
            'stats' => [
                'total' => $users->count(),
                'online' => $users->where('online', true)->count(),
                'loggedInToday' => $users->filter(fn ($u) => $u['last_login_at'] && now()->parse($u['last_login_at'])->isToday())->count(),
                'neverLoggedIn' => $users->whereNull('last_login_at')->count(),
            ],
        ]);
    }
}

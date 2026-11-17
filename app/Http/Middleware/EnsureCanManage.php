<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Only admins may change data; registered users are read-only.
 */
class EnsureCanManage
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->isMethodSafe()) {
            abort_unless($request->user()?->canManage(), 403, 'You have view-only access.');
        }

        return $next($request);
    }
}

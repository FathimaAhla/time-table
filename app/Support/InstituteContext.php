<?php

namespace App\Support;

use App\Models\Institute;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

/**
 * Resolves which institute the current request should be scoped to.
 *
 * - A normal (institute) user is always scoped to their own institute.
 * - A super admin sees everything by default, unless they have picked an
 *   institute to "view as" (stored in the session), in which case every
 *   institute-owned model is scoped to that institute too.
 */
class InstituteContext
{
    public static function isSuperAdmin(): bool
    {
        $user = Auth::user();

        return $user !== null && $user->role === 'super_admin';
    }

    /**
     * The institute_id query scoping should apply, or null for "no scope"
     * (only ever the case for a super admin who hasn't picked one).
     */
    public static function id(): ?int
    {
        $user = Auth::user();

        if ($user === null) {
            return null;
        }

        if (! self::isSuperAdmin()) {
            return $user->institute_id;
        }

        return Session::get('viewing_institute_id', $user->institute_id);
    }

    public static function current(): ?Institute
    {
        $id = self::id();

        return $id ? Institute::find($id) : null;
    }

    public static function setViewing(?int $instituteId): void
    {
        if ($instituteId === null) {
            Session::forget('viewing_institute_id');

            return;
        }

        Session::put('viewing_institute_id', $instituteId);
    }
}

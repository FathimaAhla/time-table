<?php

namespace App\Services;

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\Term;
use App\Models\TimeSlot;
use App\Models\Timetable;
use App\Models\TimetableChangeLog;
use App\Models\TimetableSession;
use App\Models\WeekDay;
use Illuminate\Support\Facades\DB;

class TimetableGenerator
{
    /**
     * When a class teacher is assigned to a class, automatically place
     * their teaching subject into the first period of every school day
     * for that class, so the class teacher always opens the day with
     * their own class. Only acts when the teacher qualifies for exactly
     * one subject in that class's grade; otherwise it's left for the
     * admin to assign manually (ambiguous or no match).
     */
    public function applyClassTeacherSubject(SchoolClass $schoolClass, ?int $actorId = null): ?string
    {
        if (! $schoolClass->class_teacher_id || ! $schoolClass->class_teacher_first_period) {
            return null;
        }

        $teacher = Teacher::find($schoolClass->class_teacher_id);
        if (! $teacher) {
            return null;
        }

        $term = Term::where('is_current', true)->first();
        if (! $term) {
            return 'No current term is set, so the class teacher\'s period could not be scheduled.';
        }

        $qualifyingSubjects = Subject::whereHas(
            'teachers',
            fn ($q) => $q->where('teachers.id', $teacher->id)
        )->whereHas(
            'grades',
            fn ($q) => $q->where('grades.id', $schoolClass->grade_id)
        )->get();

        if ($qualifyingSubjects->count() !== 1) {
            return null;
        }

        $subject = $qualifyingSubjects->first();
        $weeklyPeriods = (int) ($subject->grades->firstWhere('id', $schoolClass->grade_id)?->pivot?->weekly_periods ?? 5);

        return DB::transaction(function () use ($schoolClass, $teacher, $term, $subject, $weeklyPeriods, $actorId) {
            $assignment = TeacherAssignment::updateOrCreate(
                [
                    'term_id' => $term->id,
                    'school_class_id' => $schoolClass->id,
                    'subject_id' => $subject->id,
                ],
                [
                    'teacher_id' => $teacher->id,
                    'weekly_periods' => $weeklyPeriods,
                    'status' => 'active',
                ]
            );

            $timetable = Timetable::firstOrCreate(
                ['term_id' => $term->id, 'school_class_id' => $schoolClass->id],
                ['status' => 'draft']
            );

            $firstPeriod = TimeSlot::where('slot_type', 'period')->orderBy('sort_order')->first();
            if (! $firstPeriod) {
                return null;
            }

            foreach (WeekDay::where('is_school_day', true)->get() as $day) {
                $session = TimetableSession::where('timetable_id', $timetable->id)
                    ->where('week_day_id', $day->id)
                    ->where('time_slot_id', $firstPeriod->id)
                    ->first();

                if ($session && $session->is_locked) {
                    continue;
                }

                if ($session) {
                    $session->update([
                        'teacher_assignment_id' => $assignment->id,
                        'subject_id' => $subject->id,
                        'teacher_id' => $teacher->id,
                        'is_locked' => true,
                    ]);
                } else {
                    TimetableSession::create([
                        'timetable_id' => $timetable->id,
                        'week_day_id' => $day->id,
                        'time_slot_id' => $firstPeriod->id,
                        'teacher_assignment_id' => $assignment->id,
                        'subject_id' => $subject->id,
                        'teacher_id' => $teacher->id,
                        'is_locked' => true,
                    ]);
                }
            }

            TimetableChangeLog::create([
                'timetable_id' => $timetable->id,
                'action' => 'create',
                'changed_by' => $actorId,
                'new_value' => ['scope' => 'class_teacher_period', 'teacher_id' => $teacher->id, 'subject_id' => $subject->id],
            ]);

            return null;
        });
    }

    /**
     * Full regenerate: wipes every non-locked session for the class/term and
     * places all active teacher assignments from scratch.
     */
    public function regenerate(int $termId, int $schoolClassId, ?int $actorId = null): Timetable
    {
        return DB::transaction(function () use ($termId, $schoolClassId, $actorId) {
            $timetable = Timetable::firstOrCreate(
                ['term_id' => $termId, 'school_class_id' => $schoolClassId],
                ['status' => 'draft']
            );

            TimetableSession::where('timetable_id', $timetable->id)
                ->where('is_locked', false)
                ->delete();

            $this->placePendingAssignments($timetable, onlyPending: false);

            $timetable->update([
                'generated_at' => now(),
                'is_out_of_sync' => $this->hasUnplacedAssignments($timetable),
                'last_synced_at' => now(),
            ]);

            TimetableChangeLog::create([
                'timetable_id' => $timetable->id,
                'action' => 'regenerate',
                'changed_by' => $actorId,
                'new_value' => ['scope' => 'full'],
            ]);

            return $timetable->refresh();
        });
    }

    /**
     * Partial sync: only places assignments flagged `pending`/new, leaving
     * every existing (and especially manually edited/locked) cell untouched.
     */
    public function sync(int $termId, int $schoolClassId, ?int $actorId = null): Timetable
    {
        return DB::transaction(function () use ($termId, $schoolClassId, $actorId) {
            $timetable = Timetable::firstOrCreate(
                ['term_id' => $termId, 'school_class_id' => $schoolClassId],
                ['status' => 'draft']
            );

            // Clear out sessions whose assignment changed teacher/subject (but keep the cell locked state).
            $pending = TeacherAssignment::where('term_id', $termId)
                ->where('school_class_id', $schoolClassId)
                ->where('sync_status', 'pending')
                ->get();

            foreach ($pending as $assignment) {
                TimetableSession::where('timetable_id', $timetable->id)
                    ->where('teacher_assignment_id', $assignment->id)
                    ->where('is_locked', false)
                    ->delete();
            }

            $this->placePendingAssignments($timetable, onlyPending: true);

            $stillOutOfSync = $this->hasUnplacedAssignments($timetable);

            $timetable->update([
                'is_out_of_sync' => $stillOutOfSync,
                'last_synced_at' => now(),
            ]);

            TimetableChangeLog::create([
                'timetable_id' => $timetable->id,
                'action' => 'sync',
                'changed_by' => $actorId,
                'new_value' => ['assignments_synced' => $pending->pluck('id')],
            ]);

            return $timetable->refresh();
        });
    }

    protected function placePendingAssignments(Timetable $timetable, bool $onlyPending): void
    {
        $query = TeacherAssignment::where('term_id', $timetable->term_id)
            ->where('school_class_id', $timetable->school_class_id)
            ->where('status', 'active');

        if ($onlyPending) {
            $query->where('sync_status', 'pending');
        }

        $assignments = $query->get();

        $weekDays = WeekDay::where('is_school_day', true)->orderBy('sort_order')->get();
        $teachingSlots = TimeSlot::where('slot_type', 'period')->orderBy('sort_order')->get();

        // Pre-compute fixed, non-teaching slots so we never place a subject there.
        $cells = $weekDays->flatMap(
            fn (WeekDay $day) => $teachingSlots->map(fn (TimeSlot $slot) => [$day->id, $slot->id])
        )->values();

        foreach ($assignments as $assignment) {
            $remaining = $assignment->weekly_periods;
            $usedDaysForSubject = [];

            foreach ($cells as [$dayId, $slotId]) {
                if ($remaining <= 0) {
                    break;
                }

                // Spread periods across days: skip a day already used for this subject unless we run out of options.
                if (in_array($dayId, $usedDaysForSubject, true) && count($usedDaysForSubject) < $weekDays->count()) {
                    continue;
                }

                $cellTaken = TimetableSession::where('timetable_id', $timetable->id)
                    ->where('week_day_id', $dayId)
                    ->where('time_slot_id', $slotId)
                    ->exists();

                if ($cellTaken) {
                    continue;
                }

                if ($this->teacherHasClash($assignment->teacher_id, $dayId, $slotId)) {
                    continue;
                }

                if ($this->teacherExceedsDailyLimit($assignment->teacher_id, $dayId, $timetable)) {
                    continue;
                }

                TimetableSession::create([
                    'timetable_id' => $timetable->id,
                    'week_day_id' => $dayId,
                    'time_slot_id' => $slotId,
                    'teacher_assignment_id' => $assignment->id,
                    'subject_id' => $assignment->subject_id,
                    'teacher_id' => $assignment->teacher_id,
                ]);

                $usedDaysForSubject[] = $dayId;
                $remaining--;
            }

            $assignment->update([
                'sync_status' => $remaining > 0 ? 'pending' : 'synced',
                'applied_at' => now(),
            ]);
        }
    }

    protected function teacherHasClash(int $teacherId, int $dayId, int $slotId): bool
    {
        return TimetableSession::where('teacher_id', $teacherId)
            ->where('week_day_id', $dayId)
            ->where('time_slot_id', $slotId)
            ->exists();
    }

    protected function teacherExceedsDailyLimit(int $teacherId, int $dayId, Timetable $timetable): bool
    {
        $teacher = Teacher::find($teacherId);
        if (! $teacher) {
            return false;
        }

        $countToday = TimetableSession::where('teacher_id', $teacherId)
            ->where('week_day_id', $dayId)
            ->count();

        return $countToday >= $teacher->max_periods_per_day;
    }

    protected function hasUnplacedAssignments(Timetable $timetable): bool
    {
        return TeacherAssignment::where('term_id', $timetable->term_id)
            ->where('school_class_id', $timetable->school_class_id)
            ->where('status', 'active')
            ->where('sync_status', '!=', 'synced')
            ->exists();
    }

    /**
     * Validate + apply a manual drag-and-drop move of one session to a new day/slot.
     * Returns null on success, or an error message string on failure.
     */
    public function moveSession(TimetableSession $session, int $newWeekDayId, int $newTimeSlotId, ?int $actorId = null): ?string
    {
        if ($session->is_locked) {
            return 'This period is locked and cannot be moved.';
        }

        $targetSlot = TimeSlot::find($newTimeSlotId);
        if (! $targetSlot || $targetSlot->slot_type !== 'period') {
            return 'You cannot drop a class period onto a fixed/break slot.';
        }

        $occupied = TimetableSession::where('timetable_id', $session->timetable_id)
            ->where('week_day_id', $newWeekDayId)
            ->where('time_slot_id', $newTimeSlotId)
            ->where('id', '!=', $session->id)
            ->first();

        if ($occupied) {
            return 'That slot is already occupied in this class. Use Exchange to swap instead.';
        }

        if ($session->teacher_id && TimetableSession::where('teacher_id', $session->teacher_id)
            ->where('week_day_id', $newWeekDayId)
            ->where('time_slot_id', $newTimeSlotId)
            ->where('id', '!=', $session->id)
            ->exists()) {
            return 'The teacher for this period is already scheduled elsewhere at that time.';
        }

        $old = $session->only(['week_day_id', 'time_slot_id']);

        $session->update(['week_day_id' => $newWeekDayId, 'time_slot_id' => $newTimeSlotId]);

        TimetableChangeLog::create([
            'timetable_id' => $session->timetable_id,
            'timetable_session_id' => $session->id,
            'action' => 'move',
            'changed_by' => $actorId,
            'old_value' => $old,
            'new_value' => ['week_day_id' => $newWeekDayId, 'time_slot_id' => $newTimeSlotId],
        ]);

        return null;
    }

    /**
     * Swap two sessions' day/time slot (and, if from different classes/teacher
     * ownership, validates both resulting positions).
     */
    public function swapSessions(TimetableSession $a, TimetableSession $b, ?int $actorId = null): ?string
    {
        if ($a->is_locked || $b->is_locked) {
            return 'One of these periods is locked and cannot be swapped.';
        }

        if ($a->teacher_id && TimetableSession::where('teacher_id', $a->teacher_id)
            ->where('week_day_id', $b->week_day_id)->where('time_slot_id', $b->time_slot_id)
            ->where('id', '!=', $a->id)->where('id', '!=', $b->id)->exists()) {
            return 'Swap would double-book a teacher.';
        }

        if ($b->teacher_id && TimetableSession::where('teacher_id', $b->teacher_id)
            ->where('week_day_id', $a->week_day_id)->where('time_slot_id', $a->time_slot_id)
            ->where('id', '!=', $a->id)->where('id', '!=', $b->id)->exists()) {
            return 'Swap would double-book a teacher.';
        }

        $aOld = $a->only(['week_day_id', 'time_slot_id']);
        $bOld = $b->only(['week_day_id', 'time_slot_id']);

        // Exchange what is taught rather than where: moving rows into each other's
        // cell would violate the unique (timetable, day, slot) constraint mid-swap.
        $content = ['teacher_assignment_id', 'subject_id', 'teacher_id', 'room'];
        $aContent = $a->only($content);
        $bContent = $b->only($content);

        if ($a->timetable_id === $b->timetable_id) {
            DB::transaction(function () use ($a, $b, $aContent, $bContent) {
                $a->update($bContent);
                $b->update($aContent);
            });
        } else {
            DB::transaction(function () use ($a, $b, $aOld, $bOld) {
                $a->update(['week_day_id' => $bOld['week_day_id'], 'time_slot_id' => $bOld['time_slot_id']]);
                $b->update(['week_day_id' => $aOld['week_day_id'], 'time_slot_id' => $aOld['time_slot_id']]);
            });
        }

        TimetableChangeLog::create([
            'timetable_id' => $a->timetable_id,
            'timetable_session_id' => $a->id,
            'action' => 'swap',
            'changed_by' => $actorId,
            'old_value' => $aOld,
            'new_value' => $bOld,
        ]);

        return null;
    }
}

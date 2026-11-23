<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimetableSession extends Model
{
    protected static function booted(): void
    {
        // Timetable is institute-scoped, so this limits sessions to the same school.
        static::addGlobalScope('institute', function (Builder $builder) {
            $builder->whereIn('timetable_id', Timetable::query()->select('id'));
        });
    }

    protected $fillable = [
        'timetable_id', 'week_day_id', 'time_slot_id', 'teacher_assignment_id',
        'subject_id', 'teacher_id', 'room', 'is_locked',
    ];

    protected $casts = [
        'is_locked' => 'boolean',
    ];

    public function timetable(): BelongsTo
    {
        return $this->belongsTo(Timetable::class);
    }

    public function weekDay(): BelongsTo
    {
        return $this->belongsTo(WeekDay::class);
    }

    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TimeSlot::class);
    }

    public function teacherAssignment(): BelongsTo
    {
        return $this->belongsTo(TeacherAssignment::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }
}

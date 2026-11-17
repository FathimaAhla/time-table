<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeacherAssignment extends Model
{
    use BelongsToInstitute, HasFactory;

    protected $fillable = [
        'institute_id', 'term_id', 'school_class_id', 'subject_id', 'teacher_id',
        'weekly_periods', 'status', 'sync_status', 'applied_at',
    ];

    protected $casts = [
        'applied_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::created(function (TeacherAssignment $assignment) {
            $assignment->sync_status = 'pending';
            $assignment->saveQuietly();
            $assignment->flagTimetableOutOfSync();
        });

        static::updated(function (TeacherAssignment $assignment) {
            if ($assignment->wasChanged(['teacher_id', 'subject_id', 'weekly_periods', 'status']) && ! $assignment->wasChanged('sync_status')) {
                $assignment->sync_status = 'pending';
                $assignment->saveQuietly();
                $assignment->flagTimetableOutOfSync();
            }
        });
    }

    public function flagTimetableOutOfSync(): void
    {
        Timetable::where('term_id', $this->term_id)
            ->where('school_class_id', $this->school_class_id)
            ->update(['is_out_of_sync' => true]);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TimetableSession::class);
    }
}

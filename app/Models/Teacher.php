<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use BelongsToInstitute, HasFactory, SoftDeletes;

    protected $fillable = [
        'institute_id', 'user_id', 'employee_no', 'full_name', 'phone', 'email',
        'qualification', 'max_periods_per_day', 'max_periods_per_week', 'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'teacher_subject');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(TeacherAssignment::class);
    }

    public function classesTaught(): HasMany
    {
        return $this->hasMany(SchoolClass::class, 'class_teacher_id');
    }

    public function weeklyAssignedPeriods(int $termId): int
    {
        return $this->assignments()
            ->where('term_id', $termId)
            ->where('status', 'active')
            ->sum('weekly_periods');
    }
}

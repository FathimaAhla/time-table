<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SchoolClass extends Model
{
    use BelongsToInstitute, HasFactory, SoftDeletes;

    protected $table = 'school_classes';

    protected $fillable = ['institute_id', 'grade_id', 'name', 'capacity', 'classroom_id', 'class_teacher_id', 'class_teacher_first_period', 'status'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['class_teacher_first_period' => 'boolean'];
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function classTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'class_teacher_id');
    }

    public function teacherAssignments(): HasMany
    {
        return $this->hasMany(TeacherAssignment::class, 'school_class_id');
    }

    public function timetables(): HasMany
    {
        return $this->hasMany(Timetable::class, 'school_class_id');
    }

    public function displayName(): string
    {
        return $this->grade->name.$this->name;
    }
}

<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Timetable extends Model
{
    use BelongsToInstitute;

    protected $fillable = [
        'institute_id', 'term_id', 'school_class_id', 'status', 'is_out_of_sync',
        'generated_at', 'published_at', 'last_synced_at',
    ];

    protected $casts = [
        'is_out_of_sync' => 'boolean',
        'generated_at' => 'datetime',
        'published_at' => 'datetime',
        'last_synced_at' => 'datetime',
    ];

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TimetableSession::class);
    }

    public function changeLogs(): HasMany
    {
        return $this->hasMany(TimetableChangeLog::class);
    }
}

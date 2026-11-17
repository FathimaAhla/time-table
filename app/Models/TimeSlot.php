<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TimeSlot extends Model
{
    use BelongsToInstitute;

    protected $fillable = [
        'institute_id', 'name', 'start_time', 'end_time', 'sort_order',
        'slot_type', 'fixed_activity_name', 'applies_to_all_grades',
    ];

    protected $casts = [
        'applies_to_all_grades' => 'boolean',
    ];

    public function grades(): BelongsToMany
    {
        return $this->belongsToMany(Grade::class, 'time_slot_grade');
    }

    public function isTeaching(): bool
    {
        return $this->slot_type === 'period';
    }
}

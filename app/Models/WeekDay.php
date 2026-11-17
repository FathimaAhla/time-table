<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitute;
use Illuminate\Database\Eloquent\Model;

class WeekDay extends Model
{
    use BelongsToInstitute;

    protected $fillable = ['institute_id', 'name', 'short_code', 'sort_order', 'is_school_day'];

    protected $casts = [
        'is_school_day' => 'boolean',
    ];
}

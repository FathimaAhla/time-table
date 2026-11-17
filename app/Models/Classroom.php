<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitute;
use Database\Factories\ClassroomFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A physical room in the school (e.g. "Room 101") that a class is housed in.
 */
class Classroom extends Model
{
    /** @use HasFactory<ClassroomFactory> */
    use BelongsToInstitute, HasFactory, SoftDeletes;

    protected $fillable = ['institute_id', 'name', 'building', 'capacity', 'status'];

    public function schoolClass(): HasOne
    {
        return $this->hasOne(SchoolClass::class);
    }
}

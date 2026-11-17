<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Institute extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type', 'address', 'phone', 'email', 'logo_path'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function label(): string
    {
        return match ($this->type) {
            'tuition' => 'Tuition',
            'institute' => 'Institute',
            default => 'School',
        };
    }
}

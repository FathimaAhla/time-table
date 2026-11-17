<?php

namespace App\Models\Concerns;

use App\Models\Institute;
use App\Models\Scopes\InstituteScope;
use App\Support\InstituteContext;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToInstitute
{
    public static function bootBelongsToInstitute(): void
    {
        static::addGlobalScope(new InstituteScope);

        static::creating(function ($model) {
            if (! $model->institute_id) {
                $model->institute_id = InstituteContext::id();
            }
        });
    }

    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }
}

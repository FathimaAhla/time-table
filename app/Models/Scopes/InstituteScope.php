<?php

namespace App\Models\Scopes;

use App\Support\InstituteContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class InstituteScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $instituteId = InstituteContext::id();

        if ($instituteId !== null) {
            $builder->where($model->getTable().'.institute_id', $instituteId);
        }
    }
}

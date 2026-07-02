<?php

namespace App\Models\Concerns;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(fn (Model $model) => static::audit('created', $model, $model->getAttributes()));
        static::updated(fn (Model $model) => static::audit('updated', $model, $model->getChanges()));
        static::deleted(fn (Model $model) => static::audit('deleted', $model, null));
    }

    protected static function audit(string $action, Model $model, ?array $changes): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'auditable_type' => class_basename($model),
            'auditable_id' => $model->getKey(),
            'changes' => $changes,
        ]);
    }
}

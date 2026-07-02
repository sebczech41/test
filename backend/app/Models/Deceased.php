<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'plot_id',
    'family_id',
    'first_name',
    'last_name',
    'date_of_birth',
    'date_of_death',
    'interment_date',
    'interment_type',
    'notes',
])]
class Deceased extends Model
{
    use Auditable;

    protected $table = 'deceaseds';

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'date_of_death' => 'date',
            'interment_date' => 'date',
        ];
    }

    public function plot(): BelongsTo
    {
        return $this->belongsTo(Plot::class);
    }

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }
}

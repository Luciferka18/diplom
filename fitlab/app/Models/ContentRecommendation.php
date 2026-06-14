<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContentRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_type', 'source_id', 'placement', 'target_type', 'target_id',
        'headline', 'description', 'cta_label', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'source_id' => 'integer',
        'target_id' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}

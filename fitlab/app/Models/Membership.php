<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Membership extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'duration_months', 'trial_visits', 'price', 'old_price',
        'features', 'badge', 'is_trial', 'is_featured', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'is_trial' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'integer',
        'old_price' => 'integer',
    ];

    public function purchases()
    {
        return $this->hasMany(UserMembership::class);
    }
}

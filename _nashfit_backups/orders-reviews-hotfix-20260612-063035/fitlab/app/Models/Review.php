<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reviewable_type',
        'reviewable_id',
        'rating',
        'text',
        'advantages',
        'disadvantages',
        'photos',
        'verified_purchase',
        'trainer_recommendation',
    ];

    protected $casts = ['photos' => 'array', 'verified_purchase' => 'boolean', 'trainer_recommendation' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewable()
    {
        return $this->morphTo();
    }
}

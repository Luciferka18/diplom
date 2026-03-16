<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trainer extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'specialization', 'experience_years', 'bio', 'photo_url', 'instagram', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable')->latest();
    }

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}

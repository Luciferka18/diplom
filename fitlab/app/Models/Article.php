<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $table = 'articles';

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'cover_image_url',
        'category',
        'content',
        'status',
        'is_featured',
        'is_trainer_article',
        'reading_time_minutes',
        'views_count',
        'helpful_count',
        'rejection_reason',
        'published_at',
        'author_user_id',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_featured' => 'boolean',
        'is_trainer_article' => 'boolean',
        'reading_time_minutes' => 'integer',
        'views_count' => 'integer',
        'helpful_count' => 'integer',
    ];

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', 'published')
            ->where(function (Builder $builder) {
                $builder->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_user_id');
    }

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'article_favorites')->withTimestamps();
    }

    public function helpfulVoters()
    {
        return $this->belongsToMany(User::class, 'article_helpful_votes')->withTimestamps();
    }
}

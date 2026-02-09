<?php

namespace App\Providers;

use App\Models\Article;
use App\Models\Booking;
use App\Policies\ArticlePolicy;
use App\Policies\BookingPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Article::class => ArticlePolicy::class,
        Booking::class => BookingPolicy::class,
    ];

    public function boot(): void
    {
    }
}

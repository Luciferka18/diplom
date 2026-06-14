<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProgramResource;
use App\Http\Resources\TrainerResource;
use App\Models\Article;
use App\Models\Booking;
use App\Models\Membership;
use App\Models\Product;
use App\Models\Program;
use App\Models\Promotion;
use App\Models\Review;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Throwable;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $trainers = $this->safeCollection(fn () => Trainer::query()
            ->with(['user', 'reviews.user', 'services', 'tags'])
            ->orderByDesc('experience_years')
            ->limit(8)
            ->get());

        $programs = $this->safeCollection(fn () => Program::query()
            ->with(['trainer.user', 'trainer.reviews.user', 'trainer.services', 'tags'])
            ->withCount('workouts')
            ->latest()
            ->limit(12)
            ->get());

        $products = $this->safeCollection(fn () => Product::query()
            ->where('is_active', true)
            ->with(['category', 'variants', 'tags', 'trainerRecommendations'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->orderByDesc('is_featured')
            ->orderByDesc('trainer_pick')
            ->orderByDesc('views_count')
            ->limit(16)
            ->get());

        $articles = $this->safeCollection(fn () => Article::query()
            ->published()
            ->with(['author.trainerProfile', 'tags'])
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at')
            ->limit(12)
            ->get());

        $memberships = $this->safeCollection(fn () => Membership::query()
            ->where('is_active', true)
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->get());

        $promotion = $this->safeModel(fn () => Promotion::query()
            ->currentlyActive()
            ->orderByDesc('auto_apply')
            ->latest('starts_at')
            ->first());

        $featuredPrograms = $programs->take(4)->values();
        $featuredTrainers = $trainers->take(4)->values();
        $featuredProducts = $products->take(4)->values();
        $featuredArticles = $articles->take(4)->values();

        return response()->json([
            'gym' => [
                'name' => 'НашФит',
                'description' => 'Фитнес-клуб и digital-платформа: бесплатные программы, экспертные статьи и офлайн-тренировки.',
                'address' => 'ул. Спортивная, 10',
                'phone' => '+7 (999) 000-00-00',
                'working_hours' => 'Ежедневно, 07:00–23:00',
            ],
            'stats' => $this->stats(),
            'promotion' => $promotion ? $this->promotionData($promotion) : null,
            'trial_membership' => $this->membershipData($memberships->firstWhere('is_trial', true)),
            'featured_membership' => $this->membershipData(
                $memberships->first(fn ($item) => !$item->is_trial && $item->is_featured)
                    ?? $memberships->first(fn ($item) => !$item->is_trial)
            ),
            'memberships' => $memberships
                ->reject(fn ($item) => (bool) $item->is_trial)
                ->take(3)
                ->map(fn ($item) => $this->membershipData($item))
                ->values(),
            'trainers' => TrainerResource::collection($featuredTrainers)->resolve($request),
            'programs' => ProgramResource::collection($featuredPrograms)->resolve($request),
            'products' => ProductResource::collection($featuredProducts)->resolve($request),
            'articles' => ArticleResource::collection($featuredArticles)->resolve($request),
            'muscle_groups' => $this->muscleGroups($request, $programs, $trainers, $articles, $products),
        ]);
    }

    private function stats(): array
    {
        return [
            'trainers' => $this->safeCount(fn () => Trainer::query()->count()),
            'programs' => $this->safeCount(fn () => Program::query()->count()),
            'articles' => $this->safeCount(fn () => Article::query()->published()->count()),
            'products' => $this->safeCount(fn () => Product::query()->where('is_active', true)->count()),
            'members' => $this->safeCount(fn () => User::query()->where('role', 'user')->count()),
            'bookings' => $this->safeCount(fn () => Booking::query()->count()),
            'reviews' => $this->safeCount(fn () => Review::query()->count()),
            'rating' => round((float) ($this->safeValue(fn () => Review::query()->avg('rating'), 0) ?: 0), 1),
        ];
    }

    private function muscleGroups(
        Request $request,
        Collection $programs,
        Collection $trainers,
        Collection $articles,
        Collection $products
    ): array {
        $definitions = [
            [
                'key' => 'chest',
                'label' => 'Грудь',
                'short_label' => 'Грудные мышцы',
                'description' => 'Сила верхней части тела, техника жимов и уверенная осанка.',
                'tags' => ['strength', 'muscle'],
                'view' => 'front',
            ],
            [
                'key' => 'shoulders',
                'label' => 'Плечи',
                'short_label' => 'Плечевой пояс',
                'description' => 'Мобильность плеч, стабильность суставов и выразительный силуэт.',
                'tags' => ['functional', 'strength', 'mobility'],
                'view' => 'front',
            ],
            [
                'key' => 'arms',
                'label' => 'Руки',
                'short_label' => 'Бицепс и трицепс',
                'description' => 'Развитие силы рук, хвата и техники упражнений с отягощением.',
                'tags' => ['muscle', 'strength', 'boxing'],
                'view' => 'front',
            ],
            [
                'key' => 'core',
                'label' => 'Корпус',
                'short_label' => 'Пресс и мышцы кора',
                'description' => 'Сильный центр тела, баланс и контроль движения.',
                'tags' => ['core', 'functional', 'yoga'],
                'view' => 'front',
            ],
            [
                'key' => 'legs',
                'label' => 'Ноги',
                'short_label' => 'Бёдра и голени',
                'description' => 'Сила ног, беговая выносливость и устойчивость в движении.',
                'tags' => ['running', 'strength', 'weight-loss'],
                'view' => 'front',
            ],
            [
                'key' => 'back',
                'label' => 'Спина',
                'short_label' => 'Широчайшие и поясница',
                'description' => 'Здоровая спина, осанка и безопасная техника тяг.',
                'tags' => ['back', 'recovery', 'strength'],
                'view' => 'back',
            ],
            [
                'key' => 'glutes',
                'label' => 'Ягодицы',
                'short_label' => 'Ягодичные мышцы',
                'description' => 'Сильный таз, стабильные колени и мощное движение.',
                'tags' => ['functional', 'weight-loss', 'strength'],
                'view' => 'back',
            ],
            [
                'key' => 'mobility',
                'label' => 'Всё тело',
                'short_label' => 'Мобильность и восстановление',
                'description' => 'Снятие напряжения, развитие гибкости и качественное восстановление.',
                'tags' => ['mobility', 'yoga', 'recovery'],
                'view' => 'back',
            ],
        ];

        return collect($definitions)->map(function (array $definition) use ($request, $programs, $trainers, $articles, $products) {
            $program = $this->pickByTags($programs, $definition['tags']);
            $trainer = $this->pickByTags($trainers, $definition['tags']);
            $article = $this->pickByTags($articles, $definition['tags']);
            $product = $this->pickByTags($products, $definition['tags']);

            return array_merge($definition, [
                'program' => $program ? (new ProgramResource($program))->resolve($request) : null,
                'trainer' => $trainer ? (new TrainerResource($trainer))->resolve($request) : null,
                'article' => $article ? (new ArticleResource($article))->resolve($request) : null,
                'product' => $product ? (new ProductResource($product))->resolve($request) : null,
            ]);
        })->values()->all();
    }

    private function pickByTags(Collection $items, array $tagSlugs)
    {
        return $items->first(function ($item) use ($tagSlugs) {
            if (!$item->relationLoaded('tags')) {
                return false;
            }

            return $item->tags->pluck('slug')->intersect($tagSlugs)->isNotEmpty();
        }) ?? $items->first();
    }

    private function membershipData(?Membership $membership): ?array
    {
        if (!$membership) {
            return null;
        }

        return [
            'id' => $membership->id,
            'name' => $membership->name,
            'slug' => $membership->slug,
            'description' => $membership->description,
            'duration_months' => $membership->duration_months,
            'trial_visits' => $membership->trial_visits,
            'price' => (int) $membership->price,
            'old_price' => $membership->old_price !== null ? (int) $membership->old_price : null,
            'features' => $membership->features ?: [],
            'badge' => $membership->badge,
            'is_trial' => (bool) $membership->is_trial,
            'is_featured' => (bool) $membership->is_featured,
        ];
    }

    private function promotionData(Promotion $promotion): array
    {
        return [
            'id' => $promotion->id,
            'name' => $promotion->name,
            'description' => $promotion->description,
            'badge' => $promotion->badge,
            'banner_title' => $promotion->banner_title,
            'banner_text' => $promotion->banner_text,
            'discount_type' => $promotion->discount_type,
            'discount_value' => $promotion->discount_value,
            'applies_to' => $promotion->applies_to ?: [],
            'ends_at' => $promotion->ends_at,
        ];
    }

    private function safeCollection(callable $callback): Collection
    {
        try {
            $value = $callback();
            return $value instanceof Collection ? $value : collect($value);
        } catch (Throwable) {
            return collect();
        }
    }

    private function safeModel(callable $callback)
    {
        try {
            return $callback();
        } catch (Throwable) {
            return null;
        }
    }

    private function safeCount(callable $callback): int
    {
        return (int) $this->safeValue($callback, 0);
    }

    private function safeValue(callable $callback, mixed $fallback = null): mixed
    {
        try {
            return $callback();
        } catch (Throwable) {
            return $fallback;
        }
    }
}

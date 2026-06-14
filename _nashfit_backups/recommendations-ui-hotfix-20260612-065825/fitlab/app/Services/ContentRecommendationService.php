<?php

namespace App\Services;

use App\Models\Article;
use App\Models\ContentRecommendation;
use App\Models\Membership;
use App\Models\Product;
use App\Models\Program;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ContentRecommendationService
{
    public function forArticle(Article $article, ?User $user = null): array
    {
        $article->loadMissing(['author.trainerProfile', 'tags']);
        $category = $article->category ?: 'training';
        $productCategories = match ($category) {
            'nutrition' => ['nutrition'],
            'recovery' => ['recovery', 'nutrition'],
            'health' => ['recovery', 'home-fitness'],
            'motivation' => ['equipment', 'home-fitness', 'apparel'],
            default => ['equipment', 'home-fitness', 'apparel'],
        };

        $products = $this->productsByCategories($productCategories, 4);
        $trainers = collect();
        if ($article->author?->trainerProfile) {
            $trainers->push($article->author->trainerProfile);
        }
        $trainers = $trainers->merge($this->topTrainers(2))->unique('id')->take(2)->values();

        return $this->compose(
            'article',
            $article->id,
            'article_end',
            [
                'title' => 'Продолжите путь в НашФит',
                'subtitle' => 'Подобрали товары, тренеров и абонемент по теме статьи.',
                'reason' => $this->articleReason($category),
            ],
            $products,
            $trainers,
            $this->featuredMemberships(1)
        );
    }

    public function forProgram(Program $program, ?User $user = null): array
    {
        $program->loadMissing(['trainer', 'tags']);
        $haystack = Str::lower(trim($program->title . ' ' . $program->description . ' ' . $program->tags->pluck('slug')->join(' ')));

        $categories = ['equipment', 'home-fitness'];
        if (Str::contains($haystack, ['мас', 'сил', 'muscle', 'strength'])) {
            $categories = ['nutrition', 'equipment', 'apparel'];
        } elseif (Str::contains($haystack, ['восстанов', 'мобил', 'растяж', 'йог', 'flex'])) {
            $categories = ['recovery', 'equipment', 'home-fitness'];
        } elseif (Str::contains($haystack, ['похуд', 'кардио', 'вынослив', 'fat', 'endurance'])) {
            $categories = ['equipment', 'home-fitness', 'nutrition'];
        }

        $trainers = collect($program->trainer ? [$program->trainer] : [])
            ->merge($this->topTrainers(2))
            ->unique('id')
            ->take(2)
            ->values();

        return $this->compose(
            'program',
            $program->id,
            'program_end',
            [
                'title' => 'Ускорьте результат',
                'subtitle' => 'Инвентарь для программы, помощь тренера и доступ в офлайн-зал.',
                'reason' => 'Рекомендации подобраны по цели и уровню этой программы.',
            ],
            $this->productsByCategories($categories, 4),
            $trainers,
            $this->featuredMemberships(1)
        );
    }

    public function forAccount(User $user): array
    {
        $progress = $user->programProgresses()
            ->with(['program.trainer', 'program.tags'])
            ->whereIn('status', ['active', 'paused'])
            ->latest('last_activity_at')
            ->first();

        $recentProductIds = $user->viewedProducts()->latest('viewed_at')->limit(6)->pluck('product_id');
        $products = $this->availableProducts()
            ->when($recentProductIds->isNotEmpty(), fn (Builder $query) => $query->orderByRaw(
                'FIELD(products.id,' . $recentProductIds->map(fn ($id) => (int) $id)->join(',') . ')'
            ))
            ->where(function (Builder $query) use ($recentProductIds) {
                if ($recentProductIds->isNotEmpty()) {
                    $query->whereIn('products.id', $recentProductIds)
                        ->orWhere('trainer_pick', true)
                        ->orWhere('is_featured', true);
                } else {
                    $query->where('trainer_pick', true)->orWhere('is_featured', true);
                }
            })
            ->limit(4)
            ->get();

        $trainers = collect();
        if ($progress?->program?->trainer) {
            $trainers->push($progress->program->trainer);
        }
        $trainers = $trainers->merge($this->topTrainers(2))->unique('id')->take(2)->values();

        $hasPaidMembership = $user->memberships()
            ->where('status', 'active')
            ->whereHas('membership', fn (Builder $query) => $query->where('is_trial', false))
            ->where(fn (Builder $query) => $query->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->exists();

        return $this->compose(
            'account',
            null,
            'account_home',
            [
                'title' => $progress ? 'Рекомендации для вашего прогресса' : 'Ваш следующий шаг',
                'subtitle' => $progress
                    ? 'Учитываем активную программу и недавние интересы.'
                    : 'Начните с полезного инвентаря, консультации тренера или посещения зала.',
                'reason' => $progress?->program
                    ? 'Основано на программе «' . $progress->program->title . '».'
                    : 'Подборка популярных возможностей НашФит.',
            ],
            $products,
            $trainers,
            $hasPaidMembership ? collect() : $this->featuredMemberships(1)
        );
    }

    private function compose(
        string $sourceType,
        ?int $sourceId,
        string $placement,
        array $meta,
        Collection $products,
        Collection $trainers,
        Collection $memberships
    ): array {
        $manual = ContentRecommendation::query()
            ->active()
            ->where('source_type', $sourceType)
            ->where('placement', $placement)
            ->when($sourceId === null, fn (Builder $query) => $query->whereNull('source_id'))
            ->when($sourceId !== null, fn (Builder $query) => $query->where('source_id', $sourceId))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->groupBy('target_type');

        $resolvedProducts = $manual->has('product')
            ? $this->resolveManualProducts($manual->get('product'))
            : $products->map(fn (Product $item) => $this->formatProduct($item));

        $resolvedTrainers = $manual->has('trainer')
            ? $this->resolveManualTrainers($manual->get('trainer'))
            : $trainers->map(fn (Trainer $item) => $this->formatTrainer($item));

        $resolvedMemberships = $manual->has('membership')
            ? $this->resolveManualMemberships($manual->get('membership'))
            : $memberships->map(fn (Membership $item) => $this->formatMembership($item));

        return array_merge($meta, [
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'placement' => $placement,
            'products' => $resolvedProducts->values(),
            'trainers' => $resolvedTrainers->values(),
            'memberships' => $resolvedMemberships->values(),
        ]);
    }

    private function availableProducts(): Builder
    {
        return Product::query()
            ->where('is_active', true)
            ->where(fn (Builder $query) => $query
                ->where('stock', '>', 0)
                ->orWhereHas('variants', fn (Builder $variant) => $variant->where('is_active', true)->where('stock', '>', 0)))
            ->with(['category', 'variants' => fn ($query) => $query->where('is_active', true)->orderBy('sort_order')])
            ->withCount('reviews')
            ->withAvg('reviews as rating_avg', 'rating');
    }

    private function productsByCategories(array $slugs, int $limit): Collection
    {
        $items = $this->availableProducts()
            ->whereHas('category', fn (Builder $query) => $query->whereIn('slug', $slugs))
            ->orderByDesc('trainer_pick')
            ->orderByDesc('is_featured')
            ->orderByDesc('views_count')
            ->limit($limit)
            ->get();

        if ($items->count() < $limit) {
            $fallback = $this->availableProducts()
                ->whereNotIn('id', $items->pluck('id'))
                ->orderByDesc('trainer_pick')
                ->orderByDesc('is_featured')
                ->limit($limit - $items->count())
                ->get();
            $items = $items->merge($fallback);
        }

        return $items->take($limit)->values();
    }

    private function topTrainers(int $limit): Collection
    {
        return Trainer::query()
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->orderByDesc('reviews_avg_rating')
            ->orderByDesc('reviews_count')
            ->orderByDesc('experience_years')
            ->limit($limit)
            ->get();
    }

    private function featuredMemberships(int $limit): Collection
    {
        return Membership::query()
            ->where('is_active', true)
            ->where('is_trial', false)
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->limit($limit)
            ->get();
    }

    private function resolveManualProducts(Collection $rows): Collection
    {
        $models = $this->availableProducts()->whereIn('id', $rows->pluck('target_id'))->get()->keyBy('id');
        return $rows->map(function (ContentRecommendation $row) use ($models) {
            $model = $models->get($row->target_id);
            return $model ? $this->withCopy($this->formatProduct($model), $row) : null;
        })->filter();
    }

    private function resolveManualTrainers(Collection $rows): Collection
    {
        $models = Trainer::query()->whereIn('id', $rows->pluck('target_id'))->get()->keyBy('id');
        return $rows->map(function (ContentRecommendation $row) use ($models) {
            $model = $models->get($row->target_id);
            return $model ? $this->withCopy($this->formatTrainer($model), $row) : null;
        })->filter();
    }

    private function resolveManualMemberships(Collection $rows): Collection
    {
        $models = Membership::query()->where('is_active', true)->whereIn('id', $rows->pluck('target_id'))->get()->keyBy('id');
        return $rows->map(function (ContentRecommendation $row) use ($models) {
            $model = $models->get($row->target_id);
            return $model ? $this->withCopy($this->formatMembership($model), $row) : null;
        })->filter();
    }

    private function withCopy(array $item, ContentRecommendation $row): array
    {
        return array_merge($item, [
            'recommendation_id' => $row->id,
            'headline' => $row->headline,
            'description_override' => $row->description,
            'cta_label' => $row->cta_label,
            'is_manual' => true,
        ]);
    }

    private function formatProduct(Product $product): array
    {
        $variants = $product->relationLoaded('variants') ? $product->variants : collect();
        $stock = $variants->isNotEmpty() ? (int) $variants->sum('stock') : (int) $product->stock;
        return [
            'id' => $product->id,
            'type' => 'product',
            'name' => $product->name,
            'subtitle' => $product->short_description,
            'image_url' => $product->image_url,
            'price' => (float) $product->price,
            'old_price' => $product->old_price !== null ? (float) $product->old_price : null,
            'rating' => round((float) ($product->rating_avg ?? 0), 1),
            'reviews_count' => (int) ($product->reviews_count ?? 0),
            'in_stock' => $stock > 0,
            'badge' => $product->trainer_pick ? 'Выбор тренера' : ($product->is_new ? 'Новинка' : null),
            'href' => '/shop/' . $product->id,
            'cta_label' => 'Смотреть товар',
            'is_manual' => false,
        ];
    }

    private function formatTrainer(Trainer $trainer): array
    {
        return [
            'id' => $trainer->id,
            'type' => 'trainer',
            'name' => $trainer->name,
            'subtitle' => $trainer->specialization,
            'description' => $trainer->bio,
            'image_url' => $trainer->photo_url,
            'experience_years' => (int) $trainer->experience_years,
            'rating' => round((float) ($trainer->reviews_avg_rating ?? 0), 1),
            'reviews_count' => (int) ($trainer->reviews_count ?? 0),
            'href' => '/trainers/' . $trainer->id,
            'booking_href' => '/booking?trainer=' . $trainer->id,
            'cta_label' => 'Записаться',
            'is_manual' => false,
        ];
    }

    private function formatMembership(Membership $membership): array
    {
        return [
            'id' => $membership->id,
            'type' => 'membership',
            'name' => $membership->name,
            'subtitle' => $membership->description,
            'price' => (int) $membership->price,
            'old_price' => $membership->old_price !== null ? (int) $membership->old_price : null,
            'badge' => $membership->badge,
            'features' => $membership->features ?: [],
            'duration_months' => (int) $membership->duration_months,
            'href' => '/memberships',
            'cta_label' => 'Выбрать абонемент',
            'is_manual' => false,
        ];
    }

    private function articleReason(string $category): string
    {
        return match ($category) {
            'nutrition' => 'По теме питания и восстановления после нагрузки.',
            'recovery' => 'Для восстановления, мобильности и безопасного возвращения к нагрузке.',
            'health' => 'Для регулярных занятий и поддержки самочувствия.',
            'motivation' => 'Чтобы превратить интерес в устойчивую тренировочную привычку.',
            default => 'По теме тренировок и практического применения материала.',
        };
    }
}

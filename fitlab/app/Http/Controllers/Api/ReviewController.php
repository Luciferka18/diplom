<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Program;
use App\Models\Review;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $limit = max(1, min((int) $request->query('limit', 20), 100));
        $query = Review::query()->with(['user:id,name,login,role'])->latest('id');

        if ($request->filled('reviewable_type')) {
            $normalized = $this->normalizeReviewableType((string) $request->query('reviewable_type'));
            $query->whereIn('reviewable_type', $this->equivalentTypes($normalized));
        }

        if ($request->filled('reviewable_id')) {
            $query->where('reviewable_id', (int) $request->query('reviewable_id'));
        }

        return ReviewResource::collection($query->limit($limit)->get());
    }

    public function mine(Request $request)
    {
        $reviews = Review::query()
            ->with(['user:id,name,login,role'])
            ->where('user_id', $request->user()->id)
            ->latest('id')
            ->get();

        return ReviewResource::collection($reviews);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'text' => ['required', 'string', 'min:2', 'max:2000'],
            'reviewable_type' => ['required', 'string', 'max:255'],
            'reviewable_id' => ['required', 'integer', 'min:1'],
            'advantages' => ['nullable', 'string', 'max:2000'],
            'disadvantages' => ['nullable', 'string', 'max:2000'],
            'photos' => ['nullable', 'array', 'max:5'],
            'photos.*' => ['string', 'max:2048'],
        ]);

        $type = $this->normalizeReviewableType($data['reviewable_type']);
        $targetId = (int) $data['reviewable_id'];
        $this->assertTargetExists($type, $targetId);

        $review = DB::transaction(function () use ($request, $data, $type, $targetId) {
            $existing = Review::query()
                ->where('user_id', $request->user()->id)
                ->where('reviewable_id', $targetId)
                ->whereIn('reviewable_type', $this->equivalentTypes($type))
                ->latest('id')
                ->first();

            $values = [
                'rating' => (int) $data['rating'],
                'text' => trim($data['text']),
                'reviewable_type' => $type,
                'reviewable_id' => $targetId,
                'advantages' => isset($data['advantages']) ? trim((string) $data['advantages']) ?: null : null,
                'disadvantages' => isset($data['disadvantages']) ? trim((string) $data['disadvantages']) ?: null : null,
                'photos' => $data['photos'] ?? null,
                'verified_purchase' => $this->verifiedPurchase($request, $type, $targetId),
                'trainer_recommendation' => (bool) ($request->user()?->isTrainer() ?? false),
            ];

            if ($existing) {
                $existing->update($values);
                return $existing->refresh();
            }

            return Review::create(['user_id' => $request->user()->id] + $values);
        });

        $review->load(['user:id,name,login,role']);

        return response()->json([
            'message' => 'Отзыв сохранён.',
            'review' => new ReviewResource($review),
            'data' => new ReviewResource($review),
        ], $review->wasRecentlyCreated ? 201 : 200);
    }

    private function normalizeReviewableType(string $type): string
    {
        $type = trim($type);

        return match ($type) {
            'site', 'gym', 'club', 'fitlab' => 'site',
            'trainer', Trainer::class => Trainer::class,
            'program', Program::class => Program::class,
            'product', Product::class => Product::class,
            default => throw ValidationException::withMessages([
                'reviewable_type' => ['Этот тип объекта нельзя оценивать.'],
            ]),
        };
    }

    private function equivalentTypes(string $type): array
    {
        return match ($type) {
            Product::class => [Product::class, 'product'],
            Trainer::class => [Trainer::class, 'trainer'],
            Program::class => [Program::class, 'program'],
            'site' => ['site', 'gym', 'club', 'fitlab'],
            default => [$type],
        };
    }

    private function assertTargetExists(string $type, int $id): void
    {
        if ($type === 'site') {
            return;
        }

        $exists = match ($type) {
            Product::class => Product::query()->whereKey($id)->exists(),
            Trainer::class => Trainer::query()->whereKey($id)->exists(),
            Program::class => Program::query()->whereKey($id)->exists(),
            default => false,
        };

        if (!$exists) {
            throw ValidationException::withMessages([
                'reviewable_id' => ['Объект для отзыва не найден.'],
            ]);
        }
    }

    private function verifiedPurchase(Request $request, string $type, int $targetId): bool
    {
        if ($type !== Product::class) {
            return false;
        }

        return Order::query()
            ->where('user_id', $request->user()->id)
            ->where(function ($query) {
                $query->where('payment_status', 'paid')
                    ->orWhereIn('status', ['paid', 'processing', 'shipped', 'completed']);
            })
            ->whereHas('items', fn ($query) => $query->where('product_id', $targetId))
            ->exists();
    }
}

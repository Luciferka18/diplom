<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Booking;
use App\Models\Category;
use App\Models\GymLocation;
use App\Models\Order;
use App\Models\Product;
use App\Models\Program;
use App\Models\Review;
use App\Models\Tag;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function index(Request $request, string $entity)
    {
        $model = $this->model($entity);
        $query = $model::query()->latest('id');

        $relations = match ($entity) {
            'programs' => ['trainer'],
            'products' => ['category'],
            'articles' => ['author'],
            'orders' => ['user', 'items'],
            'bookings' => ['user', 'trainer', 'location'],
            // Site reviews store reviewable_type='site', which is not a PHP class.
            // Loading morphTo here makes Laravel throw: Class \"site\" not found.
            'reviews' => ['user'],
            default => [],
        };

        if ($relations) {
            $query->with($relations);
        }

        if ($entity === 'programs') {
            $query->withCount('workouts');
        }

        $perPage = min(max((int) $request->integer('per_page', 20), 1), 100);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request, string $entity)
    {
        return response()->json($this->model($entity)::create($this->payload($request, $entity)), 201);
    }

    public function update(Request $request, string $entity, int $id)
    {
        $item = $this->model($entity)::findOrFail($id);
        $item->update($this->payload($request, $entity, true));

        return response()->json($item);
    }

    public function destroy(string $entity, int $id)
    {
        $this->model($entity)::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $data = $request->validate(['status' => ['required', 'in:new,created,awaiting_payment,paid,completed,cancelled,refunded']]);
        $order->update(['status' => $data['status']]);
        return response()->json($order);
    }

    public function updateBookingStatus(Request $request, Booking $booking)
    {
        $data = $request->validate(['status' => ['required', 'in:booked,cancelled,completed']]);
        $booking->update(['status' => $data['status']]);
        return response()->json($booking);
    }

    private function model(string $entity): string
{
    return match ($entity) {
        'trainers' => Trainer::class,
        'programs' => Program::class,
        'products' => Product::class,
        'articles' => Article::class,
        'categories' => Category::class,
        'tags' => Tag::class,
        'locations' => GymLocation::class,

        'bookings' => Booking::class,
        'orders' => Order::class,
        'reviews' => Review::class,

        default => abort(404, 'Unknown admin entity'),
    };
}

    private function payload(Request $request, string $entity, bool $partial = false): array
    {
        return match ($entity) {
            'trainers' => $request->validate([
                'name' => [$partial ? 'sometimes' : 'required', 'string'],
                'specialization' => [$partial ? 'sometimes' : 'required', 'string'],
                'experience_years' => ['nullable', 'integer', 'min:0', 'max:60'],
                'age' => ['nullable', 'integer', 'min:18', 'max:100'],
                'bio' => ['nullable', 'string'],
                'photo_url' => ['nullable', 'string', 'max:2048'],
                'instagram' => ['nullable', 'string', 'max:255'],
                'phone' => ['nullable', 'string', 'max:32'],
                'user_id' => ['nullable', 'exists:users,id'],
            ]),
            'programs' => $this->validateProgram($request, $partial),
            'products' => $request->validate([
                'name' => [$partial ? 'sometimes' : 'required', 'string'],
                'description' => ['nullable', 'string'],
                'price' => [$partial ? 'sometimes' : 'required', 'numeric', 'min:0'],
                'stock' => ['nullable', 'integer', 'min:0'],
                'image_url' => ['nullable', 'string', 'max:2048'],
                'category_id' => ['nullable', 'exists:categories,id'],
            ]),
            'articles' => $this->validateArticle($request, $partial),
            'categories', 'tags' => $this->validateSluggedEntity($request, $partial),
            'locations' => $request->validate(['name' => [$partial ? 'sometimes' : 'required', 'string'], 'address' => [$partial ? 'sometimes' : 'required', 'string']]),
            default => [],
        };
    }


    private function validateProgram(Request $request, bool $partial): array
    {
        $data = $request->validate([
            'title' => [$partial ? 'sometimes' : 'required', 'string'],
            'description' => [$partial ? 'sometimes' : 'required', 'string'],
            'level' => [$partial ? 'sometimes' : 'required', 'in:beginner,intermediate,advanced'],
            'duration_weeks' => [$partial ? 'sometimes' : 'required', 'integer', 'min:1', 'max:52'],
            'trainer_id' => ['nullable', 'exists:trainers,id'],
            'image_url' => ['nullable', 'string', 'max:2048'],
        ]);

        $data['price'] = 0;

        return $data;
    }

    private function validateSluggedEntity(Request $request, bool $partial): array
    {
        $data = $request->validate([
            'name' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
        ]);

        if (!empty($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . Str::lower(Str::random(4));
        }

        return $data;
    }

    private function validateArticle(Request $request, bool $partial): array
    {
        $data = $request->validate([
            'title' => [$partial ? 'sometimes' : 'required', 'string'],
            'slug' => ['nullable', 'string'],
            'content' => [$partial ? 'sometimes' : 'required', 'string'],
            'author_user_id' => ['nullable', 'exists:users,id'],
            'status' => ['nullable', 'in:draft,published'],
            'published_at' => ['nullable', 'date'],
        ]);

        if (!empty($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']) . '-' . Str::lower(Str::random(4));
        }

        if (!$partial && empty($data['author_user_id'])) {
            $data['author_user_id'] = $request->user()->id;
        }

        if (($data['status'] ?? null) === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        return $data;
    }
}

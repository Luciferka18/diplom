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
use App\Models\Tag;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function index(Request $request, string $entity)
    {
        return response()->json($this->model($entity)::paginate((int) $request->integer('per_page', 20)));
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
        $data = $request->validate(['status' => ['required', 'in:created,awaiting_payment,paid,cancelled,refunded']]);
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
                'bio' => ['nullable', 'string'],
                'photo_url' => ['nullable', 'url'],
                'instagram' => ['nullable', 'string'],
                'user_id' => ['nullable', 'exists:users,id'],
            ]),
            'programs' => $request->validate([
                'title' => [$partial ? 'sometimes' : 'required', 'string'],
                'description' => [$partial ? 'sometimes' : 'required', 'string'],
                'level' => [$partial ? 'sometimes' : 'required', 'string'],
                'duration_weeks' => ['nullable', 'integer', 'min:1'],
                'price' => ['nullable', 'numeric', 'min:0'],
                'trainer_id' => ['nullable', 'exists:trainers,id'],
                'image_url' => ['nullable', 'url'],
            ]),
            'products' => $request->validate([
                'name' => [$partial ? 'sometimes' : 'required', 'string'],
                'description' => ['nullable', 'string'],
                'price' => [$partial ? 'sometimes' : 'required', 'numeric', 'min:0'],
                'stock' => ['nullable', 'integer', 'min:0'],
                'image_url' => ['nullable', 'url'],
                'category_id' => ['nullable', 'exists:categories,id'],
            ]),
            'articles' => $this->validateArticle($request, $partial),
            'categories' => $request->validate(['name' => [$partial ? 'sometimes' : 'required', 'string'], 'slug' => ['nullable', 'string']]),
            'tags' => $request->validate(['name' => [$partial ? 'sometimes' : 'required', 'string'], 'slug' => ['nullable', 'string']]),
            'locations' => $request->validate(['name' => [$partial ? 'sometimes' : 'required', 'string'], 'address' => [$partial ? 'sometimes' : 'required', 'string']]),
            default => [],
        };
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

        return $data;
    }
}

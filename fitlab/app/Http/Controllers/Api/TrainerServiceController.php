<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainer;
use App\Models\TrainerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TrainerServiceController extends Controller
{
    /**
     * Public list for booking page. Shows only active services of a selected trainer.
     */
    public function index(Trainer $trainer)
    {
        return response()->json([
            'data' => $this->servicesQuery($trainer)->where('is_active', true)->get()->map(fn (TrainerService $service) => $this->serialize($service))->values(),
        ]);
    }

    /**
     * Trainer cabinet: current trainer edits their own services.
     */
    public function mine()
    {
        $trainer = $this->currentTrainer();

        return response()->json([
            'data' => $this->servicesQuery($trainer)->get()->map(fn (TrainerService $service) => $this->serialize($service))->values(),
            'trainer' => [
                'id' => $trainer->id,
                'name' => $trainer->name,
                'specialization' => $trainer->specialization,
            ],
        ]);
    }

    public function updateMine(Request $request)
    {
        $trainer = $this->currentTrainer();
        $services = $this->replaceServices($trainer, $request);

        return response()->json([
            'message' => 'Услуги тренера обновлены.',
            'data' => $services,
        ]);
    }

    /**
     * Admin panel: open services for any trainer.
     */
    public function adminIndex(Trainer $trainer)
    {
        return response()->json([
            'data' => $this->servicesQuery($trainer)->get()->map(fn (TrainerService $service) => $this->serialize($service))->values(),
            'trainer' => [
                'id' => $trainer->id,
                'name' => $trainer->name,
                'specialization' => $trainer->specialization,
                'photo_url' => $trainer->photo_url,
            ],
        ]);
    }

    public function adminUpdate(Request $request, Trainer $trainer)
    {
        $services = $this->replaceServices($trainer, $request);

        return response()->json([
            'message' => 'Услуги тренера обновлены администратором.',
            'data' => $services,
        ]);
    }

    private function currentTrainer(): Trainer
    {
        $user = Auth::user();
        if (!$user || (!$user->isTrainer() && !$user->isAdmin())) {
            abort(response()->json(['message' => 'Unauthorized'], 403));
        }

        $trainer = $user->trainerProfile;
        if (!$trainer) {
            abort(response()->json(['message' => 'Trainer profile not found'], 404));
        }

        return $trainer;
    }

    private function servicesQuery(Trainer $trainer)
    {
        return TrainerService::query()
            ->where('trainer_id', $trainer->id)
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    private function replaceServices(Trainer $trainer, Request $request): array
    {
        $data = $request->validate([
            'services' => ['required', 'array', 'min:1', 'max:12'],
            'services.*.id' => ['nullable', 'integer', Rule::exists('trainer_services', 'id')->where('trainer_id', $trainer->id)],
            'services.*.name' => ['required', 'string', 'max:120'],
            'services.*.slug' => ['nullable', 'string', 'max:140'],
            'services.*.description' => ['nullable', 'string', 'max:1200'],
            'services.*.duration_minutes' => ['required', 'integer', 'min:15', 'max:240'],
            'services.*.price' => ['required', 'integer', 'min:0', 'max:2000000'],
            'services.*.badge' => ['nullable', 'string', 'max:40'],
            'services.*.is_intro' => ['nullable', 'boolean'],
            'services.*.is_active' => ['nullable', 'boolean'],
            'services.*.sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ]);

        $savedIds = [];

        foreach (array_values($data['services']) as $index => $serviceData) {
            $slug = $this->normalizeSlug($serviceData['slug'] ?? null, $serviceData['name']);

            $payload = [
                'trainer_id' => $trainer->id,
                'name' => trim($serviceData['name']),
                'slug' => $slug,
                'description' => $serviceData['description'] ?? null,
                'duration_minutes' => (int) $serviceData['duration_minutes'],
                'price' => (int) $serviceData['price'],
                'badge' => $serviceData['badge'] ?? null,
                'is_intro' => (bool) ($serviceData['is_intro'] ?? false),
                'is_active' => (bool) ($serviceData['is_active'] ?? true),
                'sort_order' => (int) ($serviceData['sort_order'] ?? (($index + 1) * 10)),
            ];

            if (!empty($serviceData['id'])) {
                $service = TrainerService::query()
                    ->where('trainer_id', $trainer->id)
                    ->findOrFail($serviceData['id']);
                $service->update($payload);
            } else {
                $service = TrainerService::query()->updateOrCreate(
                    ['trainer_id' => $trainer->id, 'slug' => $slug],
                    $payload
                );
            }

            $savedIds[] = $service->id;
        }

        // Услуги, которые тренер удалил из формы, не удаляем физически, чтобы не ломать историю записей.
        // Просто выключаем их из записи.
        TrainerService::query()
            ->where('trainer_id', $trainer->id)
            ->whereNotIn('id', $savedIds)
            ->update(['is_active' => false]);

        return $this->servicesQuery($trainer)->get()->map(fn (TrainerService $service) => $this->serialize($service))->values()->all();
    }

    private function normalizeSlug(?string $slug, string $name): string
    {
        $slug = trim((string) $slug);
        $slug = $slug !== '' ? Str::slug($slug) : Str::slug($name);

        if ($slug === '') {
            $slug = 'service-' . Str::lower(Str::random(6));
        }

        return $slug;
    }

    private function serialize(TrainerService $service): array
    {
        return [
            'id' => $service->id,
            'trainer_id' => $service->trainer_id,
            'name' => $service->name,
            'slug' => $service->slug,
            'description' => $service->description,
            'duration_minutes' => (int) $service->duration_minutes,
            'price' => (int) $service->price,
            'badge' => $service->badge,
            'is_intro' => (bool) $service->is_intro,
            'is_active' => (bool) $service->is_active,
            'sort_order' => (int) $service->sort_order,
            'created_at' => optional($service->created_at)->toISOString(),
            'updated_at' => optional($service->updated_at)->toISOString(),
        ];
    }
}

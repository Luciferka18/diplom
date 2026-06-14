<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ContentRecommendation;
use App\Models\Membership;
use App\Models\Product;
use App\Models\Program;
use App\Models\Trainer;
use App\Services\ContentRecommendationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ContentRecommendationController extends Controller
{
    public function show(Request $request, string $sourceType, int $sourceId, ContentRecommendationService $service)
    {
        $data = match ($sourceType) {
            'article' => $service->forArticle(
                Article::query()->published()->findOrFail($sourceId),
                $request->user('sanctum')
            ),
            'program' => $service->forProgram(
                Program::query()->findOrFail($sourceId),
                $request->user('sanctum')
            ),
            default => abort(404),
        };

        return response()->json(['data' => $data]);
    }

    public function account(Request $request, ContentRecommendationService $service)
    {
        return response()->json(['data' => $service->forAccount($request->user())]);
    }

    public function adminIndex(Request $request)
    {
        $query = ContentRecommendation::query()->latest('updated_at');
        if ($request->filled('source_type')) {
            $query->where('source_type', $request->string('source_type')->toString());
        }
        if ($request->filled('source_id')) {
            $query->where('source_id', $request->integer('source_id'));
        }

        $items = $query->get()->map(fn (ContentRecommendation $item) => $this->formatAdminItem($item));

        return response()->json(['data' => $items]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $item = ContentRecommendation::create($data);
        return response()->json(['data' => $this->formatAdminItem($item), 'message' => 'Рекомендация добавлена.'], 201);
    }

    public function update(Request $request, ContentRecommendation $recommendation)
    {
        $data = $this->validated($request, true);
        $recommendation->update($data);
        return response()->json(['data' => $this->formatAdminItem($recommendation->fresh()), 'message' => 'Рекомендация обновлена.']);
    }

    public function destroy(ContentRecommendation $recommendation)
    {
        $recommendation->delete();
        return response()->json(['message' => 'Ручная рекомендация удалена. Снова используется автоматический подбор.']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        $data = $request->validate([
            'source_type' => [$required, Rule::in(['article', 'program', 'account'])],
            'source_id' => ['nullable', 'integer'],
            'placement' => ['nullable', 'string', 'max:64'],
            'target_type' => [$required, Rule::in(['product', 'trainer', 'membership'])],
            'target_id' => [$required, 'integer'],
            'headline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'cta_label' => ['nullable', 'string', 'max:80'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:10000'],
        ]);

        $sourceType = $data['source_type'] ?? $request->input('source_type');
        $sourceId = array_key_exists('source_id', $data) ? $data['source_id'] : $request->input('source_id');
        $targetType = $data['target_type'] ?? $request->input('target_type');
        $targetId = $data['target_id'] ?? $request->input('target_id');

        if ($sourceType === 'account') {
            $data['source_id'] = null;
            $data['placement'] = $data['placement'] ?? 'account_home';
        } else {
            if (!$sourceId) {
                throw ValidationException::withMessages(['source_id' => 'Выберите статью или программу.']);
            }
            $sourceExists = $sourceType === 'article'
                ? Article::query()->whereKey($sourceId)->exists()
                : Program::query()->whereKey($sourceId)->exists();
            if (!$sourceExists) {
                throw ValidationException::withMessages(['source_id' => 'Источник не найден.']);
            }
            $data['placement'] = $data['placement'] ?? ($sourceType === 'article' ? 'article_end' : 'program_end');
        }

        if ($targetId) {
            $targetExists = match ($targetType) {
                'product' => Product::query()->whereKey($targetId)->exists(),
                'trainer' => Trainer::query()->whereKey($targetId)->exists(),
                'membership' => Membership::query()->whereKey($targetId)->exists(),
                default => false,
            };
            if (!$targetExists) {
                throw ValidationException::withMessages(['target_id' => 'Рекомендуемый объект не найден.']);
            }
        }

        $data['is_active'] = array_key_exists('is_active', $data) ? (bool) $data['is_active'] : true;
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);

        return $data;
    }

    private function formatAdminItem(ContentRecommendation $item): array
    {
        return [
            'id' => $item->id,
            'source_type' => $item->source_type,
            'source_id' => $item->source_id,
            'source_label' => $this->sourceLabel($item),
            'placement' => $item->placement,
            'target_type' => $item->target_type,
            'target_id' => $item->target_id,
            'target_label' => $this->targetLabel($item),
            'headline' => $item->headline,
            'description' => $item->description,
            'cta_label' => $item->cta_label,
            'is_active' => (bool) $item->is_active,
            'sort_order' => (int) $item->sort_order,
            'updated_at' => $item->updated_at,
        ];
    }

    private function sourceLabel(ContentRecommendation $item): string
    {
        if ($item->source_type === 'account') return 'Личный кабинет';
        if ($item->source_type === 'article') return Article::query()->whereKey($item->source_id)->value('title') ?: 'Удалённая статья';
        return Program::query()->whereKey($item->source_id)->value('title') ?: 'Удалённая программа';
    }

    private function targetLabel(ContentRecommendation $item): string
    {
        return match ($item->target_type) {
            'product' => Product::query()->whereKey($item->target_id)->value('name') ?: 'Удалённый товар',
            'trainer' => Trainer::query()->whereKey($item->target_id)->value('name') ?: 'Удалённый тренер',
            'membership' => Membership::query()->whereKey($item->target_id)->value('name') ?: 'Удалённый абонемент',
            default => 'Неизвестно',
        };
    }
}

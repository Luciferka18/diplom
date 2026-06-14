<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ArticleController extends Controller
{
    private const CATEGORIES = ['training', 'nutrition', 'recovery', 'health', 'motivation'];

    public function index(Request $request)
    {
        $query = Article::query()
            ->published()
            ->with(['author.trainerProfile']);

        $this->applyFilters($query, $request);

        $sort = $request->string('sort')->toString();
        if ($sort === 'popular') {
            $query->orderByDesc('views_count')->orderByDesc('published_at');
        } else {
            $query->orderByDesc('is_featured')->orderByDesc('published_at')->orderByDesc('id');
        }

        $perPage = min(max((int) $request->integer('per_page', 12), 1), 50);

        return ArticleResource::collection($query->paginate($perPage));
    }

    public function featured(Request $request)
    {
        $article = Article::query()
            ->published()
            ->with(['author.trainerProfile'])
            ->orderByDesc('is_featured')
            ->orderByDesc('views_count')
            ->orderByDesc('published_at')
            ->first();

        return $article ? new ArticleResource($article) : response()->json(null);
    }

    public function show(Request $request, Article $article)
    {
        return $this->showArticle($request, $article);
    }

    public function showBySlug(Request $request, string $slug)
    {
        $article = Article::query()->where('slug', $slug)->firstOrFail();
        return $this->showArticle($request, $article);
    }

    public function mine(Request $request)
    {
        $query = Article::query()
            ->where('author_user_id', $request->user()->id)
            ->with(['author.trainerProfile'])
            ->latest('updated_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        return ArticleResource::collection($query->paginate(30));
    }

    public function favorites(Request $request)
    {
        $query = $request->user()
            ->favoriteArticles()
            ->published()
            ->with(['author.trainerProfile'])
            ->orderByDesc('article_favorites.created_at');

        return ArticleResource::collection($query->paginate(30));
    }

    public function adminIndex(Request $request)
    {
        $query = Article::query()
            ->with(['author.trainerProfile'])
            ->latest('updated_at');

        if ($request->filled('status') && $request->string('status')->toString() !== 'all') {
            $query->where('status', $request->string('status')->toString());
        }

        $this->applyFilters($query, $request);

        return ArticleResource::collection($query->paginate(50));
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $data = $this->validateArticle($request);
        $intent = $request->string('intent', 'draft')->toString();

        $data = $this->prepareArticleData($data);
        $data['author_user_id'] = $user->id;
        $data['is_trainer_article'] = $user->isTrainer();
        $data['status'] = $this->statusFor($user, $intent, $data['status'] ?? null);
        $data['slug'] = $this->makeUniqueSlug($data['title'], $data['slug'] ?? null);
        $data['rejection_reason'] = null;

        if ($data['status'] === 'published') {
            $data['published_at'] = $data['published_at'] ?? now();
        } else {
            $data['published_at'] = null;
        }

        if (!$user->isAdmin()) {
            $data['is_featured'] = false;
        }

        $article = Article::create($data)->load(['author.trainerProfile']);

        return (new ArticleResource($article))->response()->setStatusCode(201);
    }

    public function update(Request $request, Article $article)
    {
        $this->authorize('update', $article);

        $user = $request->user();
        $data = $this->validateArticle($request, $article, true);
        $intent = $request->string('intent', 'draft')->toString();

        if (array_key_exists('content', $data) || array_key_exists('excerpt', $data)) {
            $data = $this->prepareArticleData(array_merge($article->only([
                'title', 'slug', 'excerpt', 'cover_image_url', 'category', 'content',
                'status', 'published_at', 'is_featured',
            ]), $data));
        }

        if (array_key_exists('title', $data) || array_key_exists('slug', $data)) {
            $data['slug'] = $this->makeUniqueSlug(
                $data['title'] ?? $article->title,
                $data['slug'] ?? $article->slug,
                $article->id
            );
        }

        $requestedStatus = $data['status'] ?? $article->status;
        $data['status'] = $this->statusFor($user, $intent, $requestedStatus, $article);
        $data['is_trainer_article'] = $article->is_trainer_article || $user->isTrainer();

        if ($data['status'] === 'published') {
            $data['published_at'] = $data['published_at'] ?? $article->published_at ?? now();
            $data['rejection_reason'] = null;
        } elseif ($data['status'] === 'pending') {
            $data['published_at'] = null;
            $data['rejection_reason'] = null;
        } elseif ($data['status'] === 'draft') {
            $data['published_at'] = null;
            $data['rejection_reason'] = null;
        }

        if (!$user->isAdmin()) {
            unset($data['is_featured']);
        }

        $article->update($data);

        return new ArticleResource($article->fresh()->load(['author.trainerProfile']));
    }

    public function submit(Request $request, Article $article)
    {
        $this->authorize('update', $article);

        $user = $request->user();
        $status = $user->isAdmin() || $user->isTrainer() ? 'published' : 'pending';

        $article->update([
            'status' => $status,
            'published_at' => $status === 'published' ? now() : null,
            'rejection_reason' => null,
            'is_trainer_article' => $article->is_trainer_article || $user->isTrainer(),
        ]);

        return new ArticleResource($article->fresh()->load(['author.trainerProfile']));
    }

    public function moderate(Request $request, Article $article)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['draft', 'pending', 'published', 'rejected', 'archived'])],
            'rejection_reason' => ['nullable', 'string', 'max:2000', Rule::requiredIf($request->input('status') === 'rejected')],
            'is_featured' => ['sometimes', 'boolean'],
        ]);

        $article->status = $data['status'];
        $article->rejection_reason = $data['status'] === 'rejected' ? $data['rejection_reason'] : null;
        $article->published_at = $data['status'] === 'published'
            ? ($article->published_at ?? now())
            : null;

        if (array_key_exists('is_featured', $data)) {
            $article->is_featured = (bool) $data['is_featured'];
        }

        $article->save();

        return new ArticleResource($article->fresh()->load(['author.trainerProfile']));
    }

    public function toggleFavorite(Request $request, Article $article)
    {
        $this->ensurePublicArticle($request, $article);
        $result = $article->favoritedBy()->toggle($request->user()->id);
        $isFavorited = count($result['attached']) > 0;

        return response()->json([
            'is_favorited' => $isFavorited,
            'favorites_count' => $article->favoritedBy()->count(),
        ]);
    }

    public function toggleHelpful(Request $request, Article $article)
    {
        $this->ensurePublicArticle($request, $article);

        return DB::transaction(function () use ($request, $article) {
            $result = $article->helpfulVoters()->toggle($request->user()->id);
            $isHelpful = count($result['attached']) > 0;
            $count = $article->helpfulVoters()->count();
            $article->update(['helpful_count' => $count]);

            return response()->json([
                'is_helpful' => $isHelpful,
                'helpful_count' => $count,
            ]);
        });
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:6144'],
        ]);

        $path = $request->file('image')->store('articles', 'public');

        return response()->json([
            'url' => url(Storage::url($path)),
        ], 201);
    }

    public function destroy(Article $article)
    {
        $this->authorize('delete', $article);
        $article->delete();

        return response()->json(['ok' => true]);
    }

    private function showArticle(Request $request, Article $article)
    {
        $this->ensurePublicArticle($request, $article);

        if ($article->status === 'published') {
            $article->increment('views_count');
        }

        return new ArticleResource($article->fresh()->load(['author.trainerProfile']));
    }

    private function ensurePublicArticle(Request $request, Article $article): void
    {
        if ($article->status === 'published' && (!$article->published_at || $article->published_at->isPast())) {
            return;
        }

        $viewer = $request->user('sanctum') ?? $request->user();
        if (!$viewer || (!$viewer->isAdmin() && $article->author_user_id !== $viewer->id)) {
            abort(404);
        }
    }

    private function applyFilters(Builder $query, Request $request): void
    {
        if ($request->filled('q')) {
            $search = trim($request->string('q')->toString());
            $query->where(function (Builder $builder) use ($search) {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->string('category')->toString() !== 'all') {
            $query->where('category', $request->string('category')->toString());
        }

        if ($request->boolean('trainer')) {
            $query->where('is_trainer_article', true);
        }
    }

    private function validateArticle(Request $request, ?Article $article = null, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'title' => [$required, 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('articles', 'slug')->ignore($article?->id)],
            'excerpt' => ['nullable', 'string', 'max:800'],
            'cover_image_url' => ['nullable', 'url', 'max:2048'],
            'category' => ['nullable', Rule::in(self::CATEGORIES)],
            'content' => [$required, 'string', 'min:20'],
            'status' => ['nullable', Rule::in(['draft', 'pending', 'published', 'rejected', 'archived'])],
            'published_at' => ['nullable', 'date'],
            'is_featured' => ['sometimes', 'boolean'],
            'intent' => ['nullable', Rule::in(['draft', 'submit', 'publish'])],
        ]);
    }

    private function prepareArticleData(array $data): array
    {
        if (array_key_exists('content', $data)) {
            $data['content'] = $this->sanitizeHtml($data['content']);
            $plainText = trim(preg_replace('/\s+/u', ' ', strip_tags($data['content'])) ?? '');
            $wordCount = str_word_count($plainText, 0, 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя');
            $data['reading_time_minutes'] = max(1, (int) ceil($wordCount / 180));

            if (empty($data['excerpt'])) {
                $data['excerpt'] = Str::limit($plainText, 220);
            }
        }

        $data['category'] = $data['category'] ?? 'training';

        return $data;
    }

    private function statusFor(User $user, string $intent, ?string $requested, ?Article $article = null): string
    {
        if ($user->isAdmin()) {
            if ($intent === 'publish') {
                return 'published';
            }
            if ($intent === 'submit') {
                return 'pending';
            }
            return $requested ?: ($article?->status ?? 'draft');
        }

        if ($user->isTrainer()) {
            return in_array($intent, ['submit', 'publish'], true)
                ? 'published'
                : ($article?->status === 'published' ? 'published' : 'draft');
        }

        if (in_array($intent, ['submit', 'publish'], true)) {
            return 'pending';
        }

        if ($article?->status === 'published') {
            return 'pending';
        }

        return 'draft';
    }

    private function makeUniqueSlug(string $title, ?string $slug = null, ?int $ignoreId = null): string
    {
        $base = Str::slug(trim((string) ($slug ?: $title)));
        if ($base === '') {
            $base = 'article-' . Str::lower(Str::random(8));
        }

        $candidate = $base;
        $number = 2;

        while (Article::query()
            ->when($ignoreId, fn (Builder $query) => $query->where('id', '!=', $ignoreId))
            ->where('slug', $candidate)
            ->exists()) {
            $candidate = $base . '-' . $number++;
        }

        return $candidate;
    }

    private function sanitizeHtml(string $html): string
    {
        $allowedTags = '<p><br><h2><h3><h4><strong><b><em><i><u><s><ul><ol><li><blockquote><a><img><figure><figcaption><div><span><hr><pre><code>';
        $html = preg_replace('#<(script|style|iframe|object|embed)[^>]*>.*?</\1>#isu', '', $html) ?? '';
        $clean = strip_tags($html, $allowedTags);

        if (!class_exists(\DOMDocument::class)) {
            $attributeValue = '(?:"[^"]*"|\'[^\']*\'|[^\s>]+)';
            $clean = preg_replace('/\s+on\w+\s*=\s*' . $attributeValue . '/isu', '', $clean) ?? '';
            $clean = preg_replace('/\s+(?:style|srcdoc)\s*=\s*' . $attributeValue . '/isu', '', $clean) ?? '';
            $clean = preg_replace('/(href|src)\s*=\s*(["\'])\s*(?:javascript|data\s*:\s*text\/html):.*?\2/isu', '$1="#"', $clean) ?? '';
            $clean = preg_replace('/(href|src)\s*=\s*(?:javascript|data\s*:\s*text\/html):[^\s>]+/isu', '$1="#"', $clean) ?? '';
            return trim($clean);
        }

        $document = new \DOMDocument('1.0', 'UTF-8');
        libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="UTF-8"><div id="article-root">' . $clean . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $root = $document->getElementById('article-root');
        if (!$root) {
            return '';
        }

        $allowedAttributes = [
            'a' => ['href', 'target', 'rel'],
            'img' => ['src', 'alt', 'title'],
            'div' => ['data-callout'],
        ];

        $walker = function (\DOMNode $node) use (&$walker, $allowedAttributes): void {
            if ($node instanceof \DOMElement) {
                $allowed = $allowedAttributes[strtolower($node->tagName)] ?? [];
                for ($i = $node->attributes->length - 1; $i >= 0; $i--) {
                    $attribute = $node->attributes->item($i);
                    if (!$attribute || !in_array(strtolower($attribute->name), $allowed, true)) {
                        if ($attribute) {
                            $node->removeAttribute($attribute->name);
                        }
                    }
                }

                foreach (['href', 'src'] as $attributeName) {
                    if (!$node->hasAttribute($attributeName)) {
                        continue;
                    }
                    $value = trim($node->getAttribute($attributeName));
                    if (!preg_match('#^(https?://|mailto:|/)#i', $value)) {
                        $node->removeAttribute($attributeName);
                    }
                }

                if (strtolower($node->tagName) === 'a' && $node->hasAttribute('href')) {
                    $node->setAttribute('target', '_blank');
                    $node->setAttribute('rel', 'noopener noreferrer');
                }
            }

            foreach (iterator_to_array($node->childNodes) as $child) {
                $walker($child);
            }
        };

        $walker($root);

        $result = '';
        foreach ($root->childNodes as $child) {
            $result .= $document->saveHTML($child);
        }

        return trim($result);
    }
}

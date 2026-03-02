<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ArticleController extends Controller
{
    public function index()
    {
        return Article::query()
            ->with('author')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->get();
    }

    public function show(Article $article)
    {
        return $article->load('author');
    }

    public function showBySlug(string $slug)
    {
        $article = Article::query()->where('slug', $slug)->firstOrFail();
        return $article->load('author');
    }

    public function store(Request $request)
    {
        $data = $this->validateArticle($request);

        $data['author_id'] = $request->user()->id;

        $data['slug'] = $this->makeUniqueSlug(
            $data['title'],
            $data['slug'] ?? null
        );

        if (($data['status'] ?? 'draft') === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $article = Article::create($data)->load('author');

        return response()->json($article, 201);
    }

    public function update(Request $request, Article $article)
    {
        $data = $this->validateArticle($request, $article);

        if (array_key_exists('title', $data) || array_key_exists('slug', $data)) {
            $data['slug'] = $this->makeUniqueSlug(
                $data['title'] ?? $article->title,
                $data['slug'] ?? $article->slug,
                $article->id
            );
        }

        if (($data['status'] ?? $article->status) === 'published') {
            if (empty($data['published_at']) && empty($article->published_at)) {
                $data['published_at'] = now();
            }
        } else {
            // если переводят в draft — published_at можно обнулить
            if (array_key_exists('status', $data)) {
                $data['published_at'] = null;
            }
        }

        $article->update($data);

        return $article->fresh()->load('author');
    }

    public function destroy(Article $article)
    {
        $article->delete();
        return response()->json(['ok' => true]);
    }

    private function validateArticle(Request $request, ?Article $article = null): array
    {
        $id = $article?->id;

        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug'  => ['nullable', 'string', 'max:255', Rule::unique('articles', 'slug')->ignore($id)],
            'content' => ['required', 'string'],
            'status' => ['nullable', 'string', Rule::in(['draft', 'published'])],
            'published_at' => ['nullable', 'date'],
        ]);
    }

    private function makeUniqueSlug(string $title, ?string $slug = null, ?int $ignoreId = null): string
    {
        $base = trim((string)$slug) !== '' ? $slug : Str::slug($title);

        // если Str::slug вернул пусто (бывает при отсутствии intl) — делаем fallback
        if ($base === '') {
            $base = 'article-' . Str::lower(Str::random(8));
        }

        $candidate = $base;
        $i = 2;

        while (
            Article::query()
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->where('slug', $candidate)
                ->exists()
        ) {
            $candidate = $base . '-' . $i;
            $i++;
        }

        return $candidate;
    }
}

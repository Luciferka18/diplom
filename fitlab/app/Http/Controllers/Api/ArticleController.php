<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::with('author')->where('status', 'published');

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(fn($w) => $w->where('title', 'like', "%{$q}%")->orWhere('content', 'like', "%{$q}%"));
        }

        if ($request->boolean('paginate')) {
            return ArticleResource::collection($query->orderByDesc('published_at')->paginate((int) $request->integer('per_page', 12)));
        }

        return ArticleResource::collection($query->orderByDesc('published_at')->limit((int) $request->integer('per_page', 12))->get());
    }

    public function show(string $article)
    {
        $item = Article::with('author')
            ->where('slug', $article)
            ->orWhere('id', $article)
            ->firstOrFail();

        return new ArticleResource($item);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string'],
            'slug' => ['nullable', 'string', 'unique:articles,slug'],
            'content' => ['required', 'string'],
            'status' => ['nullable', 'in:draft,published'],
            'published_at' => ['nullable', 'date'],
        ]);

        $data['author_user_id'] = $request->user()->id;
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']) . '-' . Str::lower(Str::random(4));

        $article = Article::create($data);

        return new ArticleResource($article->load('author'));
    }

    public function update(Request $request, Article $article)
    {
        $this->authorize('update', $article);
        $data = $request->validate([
            'title' => ['sometimes', 'string'],
            'slug' => ['sometimes', 'string', 'unique:articles,slug,' . $article->id],
            'content' => ['sometimes', 'string'],
            'status' => ['sometimes', 'in:draft,published'],
            'published_at' => ['nullable', 'date'],
        ]);
        $article->update($data);

        return new ArticleResource($article->fresh('author'));
    }

    public function destroy(Request $request, Article $article)
    {
        $this->authorize('delete', $article);
        $article->delete();
        return response()->json(['message' => 'Deleted']);
    }
}

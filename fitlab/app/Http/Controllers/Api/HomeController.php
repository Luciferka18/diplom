<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProgramResource;
use App\Http\Resources\TrainerResource;
use App\Models\Article;
use App\Models\Product;
use App\Models\Program;
use App\Models\Trainer;

class HomeController extends Controller
{
    public function index()
    {
        return response()->json([
            'gym' => [
                'name' => 'FitLab',
                'description' => 'Фитнес-клуб и digital-платформа с персональными программами.',
            ],
            'trainers' => TrainerResource::collection(Trainer::latest()->limit(3)->get()),
            'programs' => ProgramResource::collection(Program::latest()->limit(3)->get()),
            'products' => ProductResource::collection(Product::latest()->limit(3)->get()),
            'articles' => ArticleResource::collection(Article::where('status', 'published')->latest('published_at')->limit(3)->get()),
        ]);
    }
}

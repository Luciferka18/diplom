<?php

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\TrainerController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| API compatibility routes (without /api prefix)
|--------------------------------------------------------------------------
|
| Some client apps call legacy URLs like /trainers/{id} directly.
| Keep read-only aliases to prevent 404 while primary API stays under /api/*.
|
*/
Route::get('/trainers', [TrainerController::class, 'index']);
Route::get('/trainers/{id}', [TrainerController::class, 'show']);

Route::get('/programs', [ProgramController::class, 'index']);
Route::get('/programs/{id}', [ProgramController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{article}', [ArticleController::class, 'show']);

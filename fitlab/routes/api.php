<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HomeController;

Route::get('/home', [HomeController::class, 'index']);

Route::get('/trainers', [TrainerController::class, 'index']);
Route::get('/trainers/{id}', [TrainerController::class, 'show']);

Route::get('/programs', [ProgramController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);


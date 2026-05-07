<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Controllers\Api\TrainerScheduleController;
use App\Http\Controllers\Api\TrainerProfileController;
use App\Http\Controllers\Api\TwoFactorController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WorkoutController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);
Route::get('/home', [HomeController::class, 'index']);

Route::get('/trainers', [TrainerController::class, 'index']);
Route::get('/trainers/{trainer}', [TrainerController::class, 'show']);

// Расписание тренеров (публичный доступ)
Route::get('/trainers/{trainerId}/schedule', [TrainerScheduleController::class, 'index']);
Route::get('/trainers/{trainerId}/available-slots', [TrainerScheduleController::class, 'availableSlots']);

Route::get('/programs', [ProgramController::class, 'index']);
Route::get('/programs/{program}', [ProgramController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{article}', [ArticleController::class, 'show']);

Route::post('/contacts', [ContactController::class, 'send']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/2fa/verify', [TwoFactorController::class, 'verify']);

// Сброс пароля (публичные)
Route::post('/auth/password/reset', [PasswordResetController::class, 'sendResetLink']);
Route::post('/auth/password/update', [PasswordResetController::class, 'resetPassword']);
Route::post('/auth/password/verify-token', [PasswordResetController::class, 'verifyToken']);

Route::get('/articles/slug/{slug}', [\App\Http\Controllers\Api\ArticleController::class, 'showBySlug']);

Route::get('/reviews', [ReviewController::class, 'index']);

Route::post('/orders', [OrderController::class, 'store']); // без middleware

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/2fa/status', [TwoFactorController::class, 'status']);

    // Управление пользователями (только админ)
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::get('/admin/users/stats', [UserController::class, 'stats']);
        Route::get('/admin/users/{user}', [UserController::class, 'show']);
        Route::post('/admin/users/{user}/ban', [UserController::class, 'ban']);
        Route::post('/admin/users/{user}/unban', [UserController::class, 'unban']);
        Route::delete('/admin/users/{user}', [UserController::class, 'destroy']);
    });

    // 2FA routes
    Route::post('/2fa/generate', [TwoFactorController::class, 'generateSecret']);
    Route::post('/2fa/confirm', [TwoFactorController::class, 'confirmTwoFactor']);
    Route::post('/2fa/disable', [TwoFactorController::class, 'disableTwoFactor']);
    Route::post('/2fa/recovery-codes', [TwoFactorController::class, 'regenerateRecoveryCodes']);

    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/next', [BookingController::class, 'next']);
    Route::post('/bookings', [BookingController::class, 'store']);

    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::patch('/cart/items/{item}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{item}', [CartController::class, 'removeItem']);

    Route::post('/payments/intent', [PaymentController::class, 'intent']);
    Route::post('/payments/confirm', [PaymentController::class, 'confirm']);

    Route::middleware('role:admin')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        Route::post('/workouts', [WorkoutController::class, 'store']);
    });

    Route::middleware('role:trainer,admin')->group(function () {
        Route::post('/articles', [ArticleController::class, 'store']);
        Route::put('/articles/{article}', [ArticleController::class, 'update']);
        Route::delete('/articles/{article}', [ArticleController::class, 'destroy']);

        // Профиль тренера — редактирование своей информации
        Route::get('/trainer/profile', [TrainerProfileController::class, 'show']);
        Route::post('/trainer/profile', [TrainerProfileController::class, 'update']);

        // Расписание тренера — управление
        Route::put('/trainer/schedule', [TrainerScheduleController::class, 'update']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/{entity}', [AdminController::class, 'index']);
        Route::post('/admin/{entity}', [AdminController::class, 'store']);
        Route::put('/admin/{entity}/{id}', [AdminController::class, 'update']);
        Route::delete('/admin/{entity}/{id}', [AdminController::class, 'destroy']);
        Route::patch('/admin/orders/{order}/status', [AdminController::class, 'updateOrderStatus']);
        Route::patch('/admin/bookings/{booking}/status', [AdminController::class, 'updateBookingStatus']);
    });
});

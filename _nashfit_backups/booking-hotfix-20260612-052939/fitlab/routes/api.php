<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminMonetizationController;
use App\Http\Controllers\Api\MembershipController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\PromoCodeController;
use App\Http\Controllers\Api\TrainerServiceController;
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
use App\Http\Controllers\Api\ProgramProgressController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Controllers\Api\TrainerProfileController;
use App\Http\Controllers\Api\TrainerScheduleController;
use App\Http\Controllers\Api\TwoFactorController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WorkoutController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);
Route::get('/home', [HomeController::class, 'index']);

Route::get('/trainers', [TrainerController::class, 'index']);
Route::get('/trainers/{trainer}', [TrainerController::class, 'show']);
Route::get('/trainers/{trainerId}/schedule', [TrainerScheduleController::class, 'index']);
Route::get('/trainers/{trainerId}/available-slots', [TrainerScheduleController::class, 'availableSlots']);

Route::get('/programs', [ProgramController::class, 'index']);
Route::get('/programs/{program}', [ProgramController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::get('/memberships', [MembershipController::class, 'index']);
Route::get('/promotions', [PromotionController::class, 'index']);
Route::get('/trainers/{trainer}/services', [TrainerServiceController::class, 'index']);

Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/featured', [ArticleController::class, 'featured']);
Route::get('/articles/slug/{slug}', [ArticleController::class, 'showBySlug']);
Route::get('/articles/{article}', [ArticleController::class, 'show'])->whereNumber('article');

Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/contacts', [ContactController::class, 'send']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/2fa/verify', [TwoFactorController::class, 'verify']);
Route::post('/auth/password/reset', [PasswordResetController::class, 'sendResetLink']);
Route::post('/auth/password/update', [PasswordResetController::class, 'resetPassword']);
Route::post('/auth/password/verify-token', [PasswordResetController::class, 'verifyToken']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/auth/2fa/status', [TwoFactorController::class, 'status']);
    Route::post('/2fa/generate', [TwoFactorController::class, 'generateSecret']);
    Route::post('/2fa/confirm', [TwoFactorController::class, 'confirmTwoFactor']);
    Route::post('/2fa/disable', [TwoFactorController::class, 'disableTwoFactor']);
    Route::post('/2fa/recovery-codes', [TwoFactorController::class, 'regenerateRecoveryCodes']);


    Route::get('/account/programs', [ProgramProgressController::class, 'index']);
    Route::get('/programs/{program}/progress', [ProgramProgressController::class, 'show']);
    Route::post('/programs/{program}/progress/start', [ProgramProgressController::class, 'start']);
    Route::patch('/programs/{program}/progress', [ProgramProgressController::class, 'update']);
    Route::delete('/programs/{program}/progress', [ProgramProgressController::class, 'destroy']);


    Route::get('/account/memberships', [MembershipController::class, 'account']);
    Route::post('/memberships/{membership}/purchase', [MembershipController::class, 'purchase']);
    Route::post('/promo-codes/validate', [PromoCodeController::class, 'validateCode']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
    Route::post('/payments/{payment}/mock-confirm', [PaymentController::class, 'mockConfirm']);

    Route::get('/account/reviews', [ReviewController::class, 'mine']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/next', [BookingController::class, 'next']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);

    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::patch('/cart/items/{item}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{item}', [CartController::class, 'removeItem']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);

    Route::post('/payments/intent', [PaymentController::class, 'intent']);
    Route::post('/payments/confirm', [PaymentController::class, 'confirm']);

    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::get('/admin/users/stats', [UserController::class, 'stats']);
        Route::get('/admin/users/{user}', [UserController::class, 'show']);
        Route::post('/admin/users/{user}/ban', [UserController::class, 'ban']);
        Route::post('/admin/users/{user}/unban', [UserController::class, 'unban']);
        Route::delete('/admin/users/{user}', [UserController::class, 'destroy']);

        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);

        Route::post('/workouts', [WorkoutController::class, 'store']);
    });

    Route::get('/account/articles', [ArticleController::class, 'mine']);
    Route::get('/account/favorite-articles', [ArticleController::class, 'favorites']);
    Route::post('/articles', [ArticleController::class, 'store']);
    Route::put('/articles/{article}', [ArticleController::class, 'update']);
    Route::post('/articles/{article}/submit', [ArticleController::class, 'submit']);
    Route::post('/articles/{article}/favorite', [ArticleController::class, 'toggleFavorite']);
    Route::post('/articles/{article}/helpful', [ArticleController::class, 'toggleHelpful']);
    Route::post('/articles/images', [ArticleController::class, 'uploadImage']);
    Route::delete('/articles/{article}', [ArticleController::class, 'destroy']);

    Route::middleware('role:trainer,admin')->group(function () {
        Route::get('/trainer/profile', [TrainerProfileController::class, 'show']);
        Route::post('/trainer/profile', [TrainerProfileController::class, 'update']);
        Route::put('/trainer/schedule', [TrainerScheduleController::class, 'update']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/articles', [ArticleController::class, 'adminIndex']);
        Route::patch('/admin/articles/{article}/moderate', [ArticleController::class, 'moderate']);


        Route::get('/admin/monetization/{entity}', [AdminMonetizationController::class, 'index']);
        Route::post('/admin/monetization/{entity}', [AdminMonetizationController::class, 'store']);
        Route::put('/admin/monetization/{entity}/{id}', [AdminMonetizationController::class, 'update']);
        Route::delete('/admin/monetization/{entity}/{id}', [AdminMonetizationController::class, 'destroy']);

        Route::get('/admin/{entity}', [AdminController::class, 'index']);
        Route::post('/admin/{entity}', [AdminController::class, 'store']);
        Route::put('/admin/{entity}/{id}', [AdminController::class, 'update']);
        Route::delete('/admin/{entity}/{id}', [AdminController::class, 'destroy']);

        Route::patch('/admin/orders/{order}/status', [AdminController::class, 'updateOrderStatus']);
        Route::patch('/admin/bookings/{booking}/status', [AdminController::class, 'updateBookingStatus']);
    });
});

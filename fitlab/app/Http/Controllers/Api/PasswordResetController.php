<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Отправка запроса на сброс пароля
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $request->email)->first();

        // Генерируем токен сброса
        $token = Password::createToken($user);

        // Отправляем email (в реальном проекте)
        // Mail::to($user->email)->send(new ResetPasswordMail($token));

        // Для SPA возвращаем токен (в продакшене нужно отправлять email)
        return response()->json([
            'message' => 'Ссылка для сброса пароля отправлена на ваш email',
            'reset_token' => $token, // Удалить в продакшене
            'email' => $user->email,
        ]);
    }

    /**
     * Сброс пароля по токену
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'exists:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Пользователь не найден'
            ], 404);
        }

        // Проверяем токен
        if (!Password::tokenCanReset($user, $request->token)) {
            return response()->json([
                'message' => 'Неверный или истёкший токен'
            ], 422);
        }

        // Сбрасываем пароль
        $user->forceFill([
            'password' => Hash::make($request->password),
            'remember_token' => Str::random(60),
        ])->save();

        // Удаляем использованные токены
        Password::deleteToken($user);

        return response()->json([
            'message' => 'Пароль успешно изменён',
        ]);
    }

    /**
     * Проверка токена сброса пароля
     */
    public function verifyToken(Request $request)
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'valid' => false,
                'message' => 'Пользователь не найден'
            ], 404);
        }

        $isValid = Password::tokenCanReset($user, $request->token);

        return response()->json([
            'valid' => $isValid,
            'message' => $isValid ? 'Токен действителен' : 'Неверный или истёкший токен'
        ]);
    }
}

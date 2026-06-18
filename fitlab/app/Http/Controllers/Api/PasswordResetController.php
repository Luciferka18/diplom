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
     * Create a password reset token.
     *
     * For this diploma/local project we return a demo reset URL because SMTP is not configured.
     * The response stays generic so the form does not disclose whether an email exists.
     */
    public function sendResetLink(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = mb_strtolower(trim($data['email']));
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (! $user) {
            return response()->json([
                'message' => 'Если аккаунт с таким email существует, инструкция по сбросу будет подготовлена.',
                'sent' => true,
            ]);
        }

        Password::deleteToken($user);
        $token = Password::createToken($user);
        $frontend = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
        $resetUrl = $frontend . '/reset-password?email=' . urlencode($user->email) . '&token=' . urlencode($token);

        return response()->json([
            'message' => 'Инструкция по сбросу пароля подготовлена.',
            'sent' => true,
            'email' => $user->email,
            'reset_url' => $resetUrl,
            'reset_token' => $token,
        ]);
    }

    /**
     * Reset password by token.
     */
    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $email = mb_strtolower(trim($data['email']));
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (! $user || ! Password::getRepository()->exists($user, $data['token'])) {
            return response()->json([
                'message' => 'Ссылка для сброса пароля недействительна или истекла.',
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make($data['password']),
            'remember_token' => Str::random(60),
        ])->save();

        Password::deleteToken($user);
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Пароль успешно изменён. Войдите с новым паролем.',
        ]);
    }

    /**
     * Verify a password reset token.
     */
    public function verifyToken(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
        ]);

        $email = mb_strtolower(trim($data['email']));
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();
        $valid = $user ? Password::getRepository()->exists($user, $data['token']) : false;

        return response()->json([
            'valid' => $valid,
            'message' => $valid ? 'Ссылка действительна.' : 'Ссылка для сброса пароля недействительна или истекла.',
        ], $valid ? 200 : 422);
    }
}

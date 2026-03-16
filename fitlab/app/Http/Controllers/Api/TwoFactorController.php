<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    /**
     * Генерация 2FA секрета и QR-кода
     */
    public function generateSecret(Request $request)
    {
        $user = $request->user();
        
        if ($user->hasEnabledTwoFactor()) {
            return response()->json([
                'message' => '2FA уже включен'
            ], 400);
        }

        $secret = $user->generateTwoFactorSecret();
        $qrCodeUrl = $user->getTwoFactorQrCodeUrl($secret);
        $recoveryCodes = $user->generateRecoveryCodes();

        return response()->json([
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    /**
     * Подтверждение включения 2FA
     */
    public function confirmTwoFactor(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();
        $code = $request->input('code');

        if ($user->verifyTwoFactorCode($code)) {
            $user->confirmTwoFactor();
            
            return response()->json([
                'message' => '2FA успешно включен',
                'enabled' => true,
            ]);
        }

        return response()->json([
            'message' => 'Неверный код'
        ], 422);
    }

    /**
     * Отключение 2FA
     */
    public function disableTwoFactor(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Неверный пароль'
            ], 422);
        }

        $user->disableTwoFactor();

        return response()->json([
            'message' => '2FA успешно отключен',
            'enabled' => false,
        ]);
    }

    /**
     * Проверка 2FA кода при входе
     */
    public function verify(Request $request)
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'code' => ['required', 'string'],
        ]);

        $user = User::find($request->user_id);

        if (!$user || !$user->hasEnabledTwoFactor()) {
            return response()->json([
                'message' => '2FA не включен'
            ], 400);
        }

        // Проверка 2FA кода
        if ($user->verifyTwoFactorCode($request->code)) {
            $token = $user->createToken('fitlab-spa')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
            ]);
        }

        // Проверка кода восстановления
        if ($user->verifyRecoveryCode($request->code)) {
            $token = $user->createToken('fitlab-spa')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Вход выполнен с кодом восстановления',
            ]);
        }

        return response()->json([
            'message' => 'Неверный код'
        ], 422);
    }

    /**
     * Проверка статуса 2FA для пользователя
     */
    public function status(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'enabled' => $user->hasEnabledTwoFactor(),
            'confirmed' => !is_null($user->two_factor_confirmed_at),
        ]);
    }

    /**
     * Генерация новых кодов восстановления
     */
    public function regenerateRecoveryCodes(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Неверный пароль'
            ], 422);
        }

        $recoveryCodes = $user->generateRecoveryCodes();

        return response()->json([
            'recovery_codes' => $recoveryCodes,
            'message' => 'Коды восстановления перевыпущены',
        ]);
    }
}

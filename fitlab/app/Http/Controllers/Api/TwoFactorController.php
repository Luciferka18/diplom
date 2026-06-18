<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TwoFactorController extends Controller
{
    public function generateSecret(Request $request)
    {
        $user = $request->user();

        if ($user->hasEnabledTwoFactor()) {
            return response()->json(['message' => '2FA уже включена.'], 400);
        }

        $secret = $user->generateTwoFactorSecret();
        $qrCodeUrl = $user->getTwoFactorQrCodeUrl($secret);
        $recoveryCodes = $user->generateRecoveryCodes();

        return response()->json([
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'qr_code_base64' => $this->generateQrCodeBase64($qrCodeUrl),
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    private function generateQrCodeBase64(string $qrCodeUrl): string
    {
        try {
            $renderer = new ImageRenderer(
                new RendererStyle(300),
                new SvgImageBackEnd()
            );
            $writer = new Writer($renderer);
            $svg = $writer->writeString($qrCodeUrl);
            return 'data:image/svg+xml;base64,' . base64_encode($svg);
        } catch (\Throwable $e) {
            return 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($qrCodeUrl);
        }
    }

    public function confirmTwoFactor(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'min:6', 'max:12'],
        ]);

        $user = $request->user();

        if (! $user->two_factor_secret) {
            return response()->json(['message' => 'Сначала начните настройку 2FA.'], 422);
        }

        if (! $user->verifyTwoFactorCode($request->input('code'))) {
            return response()->json(['message' => 'Неверный код из приложения.'], 422);
        }

        $user->confirmTwoFactor();

        return response()->json([
            'message' => '2FA успешно включена.',
            'enabled' => true,
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function disableTwoFactor(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Неверный пароль.'], 422);
        }

        $user->disableTwoFactor();

        return response()->json([
            'message' => '2FA успешно отключена.',
            'enabled' => false,
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'code' => ['required', 'string', 'max:32'],
        ]);

        $user = User::find($request->integer('user_id'));

        if (! $user || ! $user->hasEnabledTwoFactor()) {
            return response()->json(['message' => '2FA не включена для этого аккаунта.'], 400);
        }

        $code = trim((string) $request->input('code'));
        $usedRecoveryCode = false;

        if (! $user->verifyTwoFactorCode($code)) {
            if (! $user->verifyRecoveryCode($code)) {
                return response()->json(['message' => 'Неверный код.'], 422);
            }
            $usedRecoveryCode = true;
        }

        $token = $user->createToken('nashfit-spa')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user->fresh()),
            'token' => $token,
            'requires_2fa' => false,
            'used_recovery_code' => $usedRecoveryCode,
            'message' => $usedRecoveryCode ? 'Вход выполнен с кодом восстановления.' : 'Вход выполнен.',
        ]);
    }

    public function status(Request $request)
    {
        $user = $request->user();
        $codes = $user->recoveryCodesForDisplayCount();

        return response()->json([
            'enabled' => $user->hasEnabledTwoFactor(),
            'confirmed' => ! is_null($user->two_factor_confirmed_at),
            'recovery_codes_count' => $codes,
        ]);
    }

    public function regenerateRecoveryCodes(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Неверный пароль.'], 422);
        }

        if (! $user->hasEnabledTwoFactor()) {
            return response()->json(['message' => 'Сначала включите 2FA.'], 422);
        }

        return response()->json([
            'recovery_codes' => $user->generateRecoveryCodes(),
            'message' => 'Коды восстановления перевыпущены.',
        ]);
    }
}

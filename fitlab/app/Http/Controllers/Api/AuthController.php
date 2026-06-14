<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Services\TrialMembershipService;

class AuthController extends Controller
{
    public function register(Request $request, TrialMembershipService $trialService)
    {
        $data = $request->validate([
            'login' => ['required', 'string', 'min:6', 'alpha_num', 'unique:users,login'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'name' => ['required', 'string', 'regex:/^[А-Яа-яЁё\s-]+$/u'],
            'phone' => ['required', 'string', 'regex:/^\+7\d{10}$/', 'unique:users,phone'],
            'email' => ['required', 'email', 'unique:users,email'],
        ]);

        $user = User::create([
            ...$data,
            'role' => 'user',
            'password' => Hash::make($data['password']),
        ]);

        $trialService->ensureForUser($user);

        $token = $user->createToken('nashfit-spa')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request, TrialMembershipService $trialService)
    {
        $data = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        // Ищем пользователя по логину или email
        $user = User::where('login', $data['login'])
            ->orWhere('email', $data['login'])
            ->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Проверяем, заблокирован ли пользователь
        if ($user->isBanned()) {
            return response()->json([
                'message' => 'Аккаунт заблокирован',
                'is_banned' => true,
                'ban_reason' => $user->ban_reason,
                'banned_until' => $user->banned_until?->toIso8601String(),
                'banned_by' => $user->bannedBy?->name,
            ], 403);
        }

        // Если 2FA включен, возвращаем user_id для второго шага
        if ($user->hasEnabledTwoFactor()) {
            return response()->json([
                'requires_2fa' => true,
                'user_id' => $user->id,
            ]);
        }

        $trialService->ensureForUser($user);

        $token = $user->createToken('nashfit-spa')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
            'requires_2fa' => false,
        ]);
    }

    public function me(Request $request, TrialMembershipService $trialService)
    {
        $trialService->ensureForUser($request->user());
        return response()->json(['user' => new UserResource($request->user())]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'login' => ['required', 'string', 'min:6', 'alpha_num', Rule::unique('users', 'login')->ignore($user->id)],
            'name' => ['required', 'string', 'max:255', 'regex:/^[А-Яа-яЁё\s-]+$/u'],
            'phone' => ['required', 'string', 'regex:/^\+7\d{10}$/', Rule::unique('users', 'phone')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $user->forceFill($data)->save();

        return response()->json([
            'message' => 'Профиль обновлён.',
            'user' => new UserResource($user->fresh()),
        ]);
    }
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }
}

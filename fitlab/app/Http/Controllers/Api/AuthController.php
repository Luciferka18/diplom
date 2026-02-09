<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
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

        $token = $user->createToken('fitlab-spa')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('login', $data['login'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('fitlab-spa')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => new UserResource($request->user())]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }
}

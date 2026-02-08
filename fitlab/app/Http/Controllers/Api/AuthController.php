<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'login' => 'required|string|max:255|unique:users,login',
            'password' => 'required|confirmed|min:6',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email',
        ]);

        $user = User::create([
            'login' => $data['login'],
            'password' => Hash::make($data['password']),
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('login', $data['login'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }
}

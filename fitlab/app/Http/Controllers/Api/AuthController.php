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
            'login' => 'required|min:6|alpha_num|unique:users',
            'password' => 'required|confirmed|min:8',
            'name' => ['required', 'regex:/^[\p{Cyrillic} ]+$/u'],
            'phone' => ['required', 'regex:/^\+7\d{10}$/'],
            'email' => 'required|email|unique:users',
        ]);

        $user = User::create([
            'login' => $data['login'],
            'password' => Hash::make($data['password']),
            'name' => $data['name'],
            'phone' => $data['phone'],
            'email' => $data['email'],
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
            'login' => 'required',
            'password' => 'required',
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

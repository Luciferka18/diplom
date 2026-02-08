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
            'login' => 'required|unique:users',
            'password' => 'required|confirmed|min:6',
            'name' => 'required',
            'phone' => 'nullable',
            'email' => 'nullable|email',
        ]);

        $user = User::create([
            'login' => $data['login'],
            'password' => Hash::make($data['password']),
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
        ]);

        return response()->json(['user' => $user]);
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

        return response()->json(['user' => $user]);
    }
}

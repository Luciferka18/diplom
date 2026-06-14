<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Список всех пользователей
     */
    public function index(Request $request)
    {
        $query = User::with('trainerProfile')->orderBy('created_at', 'desc');

        // Поиск
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('login', 'like', "%{$search}%");
            });
        }

        // Фильтр по роли
        if ($role = $request->get('role')) {
            $query->where('role', $role);
        }

        // Фильтр по статусу блокировки
        if ($request->has('banned')) {
            $query->where('is_banned', $request->boolean('banned'));
        }

        $users = $query->paginate($request->get('per_page', 20));

        return response()->json($users);
    }

    /**
     * Информация о пользователе
     */
    public function show(User $user)
    {
        $user->load('trainerProfile');
        return response()->json([
            'user' => $user,
            'ban_info' => [
                'is_banned' => $user->isBanned(),
                'ban_reason' => $user->ban_reason,
                'banned_until' => $user->banned_until?->toIso8601String(),
                'banned_by' => $user->bannedBy?->name,
                'remaining_days' => $user->getBanRemainingDays(),
            ],
        ]);
    }

    /**
     * Заблокировать пользователя
     */
    public function ban(Request $request, User $user)
    {
        $admin = $request->user();

        // Админ не может заблокировать другого админа
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Нельзя заблокировать администратора'
            ], 403);
        }

        // Админ не может заблокировать сам себя
        if ($user->id === $admin->id) {
            return response()->json([
                'message' => 'Нельзя заблокировать самого себя'
            ], 403);
        }

        $request->validate([
            'reason' => ['required', 'string', 'max:500'],
            'duration_days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $user->ban($request->reason, $request->duration_days, $admin->id);

        return response()->json([
            'message' => 'Пользователь заблокирован',
            'user' => $user,
        ]);
    }

    /**
     * Разблокировать пользователя
     */
    public function unban(Request $request, User $user)
    {
        $user->unban();

        return response()->json([
            'message' => 'Пользователь разблокирован',
            'user' => $user,
        ]);
    }

    /**
     * Удалить пользователя
     */
    public function destroy(Request $request, User $user)
    {
        $admin = $request->user();

        // Админ не может удалить другого админа
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Нельзя удалить администратора'
            ], 403);
        }

        // Админ не может удалить сам себя
        if ($user->id === $admin->id) {
            return response()->json([
                'message' => 'Нельзя удалить самого себя'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Пользователь удалён',
        ]);
    }

    /**
     * Статистика пользователей
     */
    public function stats()
    {
        return response()->json([
            'total' => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'trainers' => User::where('role', 'trainer')->count(),
            'users' => User::where('role', 'user')->count(),
            'banned' => User::where('is_banned', true)->count(),
        ]);
    }
}

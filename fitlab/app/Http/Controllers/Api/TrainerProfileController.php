<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrainerResource;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TrainerProfileController extends Controller
{
    /**
     * Получить профиль текущего тренера
     */
    public function show()
    {
        $user = Auth::user();
        if (!$user || !$user->isTrainer()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $trainer = $user->trainerProfile;
        if (!$trainer) {
            return response()->json(['message' => 'Trainer profile not found'], 404);
        }

        return new TrainerResource($trainer->load(['user', 'reviews.user', 'schedules.location', 'services']));
    }

    /**
     * Обновить профиль тренера
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->isTrainer()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $trainer = $user->trainerProfile;
        if (!$trainer) {
            return response()->json(['message' => 'Trainer profile not found'], 404);
        }

        $data = $request->validate([
            'specialization' => ['nullable', 'string', 'max:255'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:50'],
            'age' => ['nullable', 'integer', 'min:18', 'max:100'],
            'bio' => ['nullable', 'string'],
            'instagram' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ]);

        // Загрузка фото
        if ($request->hasFile('photo')) {
            // Удаляем старое фото
            if ($trainer->photo_url) {
                Storage::disk('public')->delete($trainer->photo_url);
            }

            $path = $request->file('photo')->store('trainers', 'public');
            $data['photo_url'] = Storage::url($path);
            unset($data['photo']);
        }

        $trainer->update($data);

        return new TrainerResource($trainer->fresh(['user', 'schedules.location', 'services']));
    }
}

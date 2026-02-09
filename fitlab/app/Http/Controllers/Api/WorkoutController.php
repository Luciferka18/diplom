<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workout;
use Illuminate\Http\Request;

class WorkoutController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'program_id' => ['nullable', 'exists:programs,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'video' => ['nullable', 'file', 'mimes:mp4,mov,avi', 'max:51200'],
        ]);

        $videoPath = $request->hasFile('video')
            ? $request->file('video')->store('workouts', 'public')
            : null;

        $workout = Workout::create([
            'program_id' => $data['program_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'video_path' => $videoPath,
        ]);

        return response()->json($workout, 201);
    }
}

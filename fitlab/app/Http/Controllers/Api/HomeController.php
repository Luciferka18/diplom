<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainer;
use App\Models\Program;
use App\Models\Review;

class HomeController extends Controller
{
    public function index()
    {
        return response()->json([
            'gym' => [
                'name' => 'FitLab Gym',
                'description' => 'Современный фитнес-зал с профессиональными тренерами, онлайн-программами и магазином спортпита.'
            ],
            'trainers' => Trainer::take(3)->get(),
            'programs' => Program::take(3)->get(),
            'reviews' => Review::take(3)->get(),
        ]);
    }
}

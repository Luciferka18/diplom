<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GymLocation;
use App\Models\Product;
use App\Models\Program;
use App\Models\Review;
use App\Models\Trainer;

class HomeController extends Controller
{
    public function index()
    {
        return response()->json([
            'gym' => [
                'name' => 'FitLab Gym',
                'description' => 'Современный фитнес-зал с профессиональными тренерами, онлайн-программами и магазином спортпита.',
                'cta' => [
                    'book_training' => '/contacts',
                    'view_programs' => '/online-programs',
                    'open_shop' => '/shop',
                ],
            ],
            'trainers' => Trainer::query()->latest()->take(3)->get(),
            'programs' => Program::query()->where('is_active', true)->take(3)->get(),
            'products' => Product::query()->where('in_stock', true)->take(6)->get(),
            'reviews' => Review::query()->latest()->take(3)->get(),
            'locations' => GymLocation::query()->take(2)->get(),
        ]);
    }
}

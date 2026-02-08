<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainer;

class TrainerController extends Controller
{
    public function index()
    {
        return response()->json(Trainer::all());
    }

    public function show($id)
    {
        return response()->json(Trainer::findOrFail($id));
    }
}

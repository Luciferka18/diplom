<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;

class PromotionController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Promotion::currentlyActive()->latest('starts_at')->get()]);
    }
}

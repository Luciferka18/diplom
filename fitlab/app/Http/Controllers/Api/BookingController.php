<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'trainer_id' => 'required|exists:trainers,id',
            'client_name' => 'required|string|max:255',
            'client_phone' => 'required|string|max:255',
            'client_comment' => 'nullable|string',
            'date' => 'required|date',
            'time' => 'required',
        ]);

        $booking = Booking::create($data + ['status' => 'new']);

        return response()->json($booking->load('trainer'), 201);
    }
}



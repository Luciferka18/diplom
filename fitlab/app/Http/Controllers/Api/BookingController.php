<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['trainer', 'location'])->latest();

        if ($request->user()->isTrainer() && $request->user()->trainerProfile) {
            $query->where('trainer_id', $request->user()->trainerProfile->id);
        } elseif (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        return BookingResource::collection($query->paginate((int) $request->integer('per_page', 10)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'trainer_id' => ['required', 'exists:trainers,id'],
            'location_id' => ['nullable', 'exists:gym_locations,id'],
            'client_name' => ['required', 'string', 'max:255'],
            'client_phone' => ['required', 'string', 'max:255'],
            'client_comment' => ['nullable', 'string'],
            'date' => ['required_without:starts_at', 'date'],
            'time' => ['required_without:starts_at', 'date_format:H:i'],
            'starts_at' => ['nullable', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:30', 'max:240'],
        ]);

        $startsAt = isset($data['starts_at'])
            ? Carbon::parse($data['starts_at'])
            : Carbon::parse("{$data['date']} {$data['time']}");
        $endsAt = (clone $startsAt)->addMinutes((int) ($data['duration_minutes'] ?? 60));

        $conflict = Booking::query()
            ->where('trainer_id', $data['trainer_id'])
            ->where('status', 'booked')
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->exists();

        if ($conflict) {
            return response()->json(['message' => 'Trainer is not available for selected time'], 422);
        }

        $booking = Booking::create([
            'user_id' => $request->user()?->id,
            'trainer_id' => $data['trainer_id'],
            'location_id' => $data['location_id'] ?? 1,
            'client_name' => $data['client_name'],
            'client_phone' => $data['client_phone'],
            'client_comment' => $data['client_comment'] ?? null,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => 'booked',
        ]);

        $nearest = Booking::where('trainer_id', $data['trainer_id'])
            ->where('starts_at', '>=', now())
            ->orderBy('starts_at')
            ->first();

        return response()->json([
            'booking' => new BookingResource($booking->load(['trainer', 'location'])),
            'nearest_booking' => $nearest ? new BookingResource($nearest->load(['trainer', 'location'])) : null,
        ], 201);
    }
}

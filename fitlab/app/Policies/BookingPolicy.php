<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function view(User $user, Booking $booking): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isTrainer() && $user->trainerProfile) {
            return $booking->trainer_id === $user->trainerProfile->id;
        }

        return $booking->user_id === $user->id;
    }
}

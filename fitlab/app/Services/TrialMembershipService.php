<?php

namespace App\Services;

use App\Models\Membership;
use App\Models\User;

class TrialMembershipService
{
    public function ensureForUser(User $user): void
    {
        $trial = Membership::query()->where('is_trial', true)->where('is_active', true)->first();
        if (!$trial) return;

        $user->memberships()->firstOrCreate(
            ['membership_id' => $trial->id, 'is_trial_grant' => true],
            [
                'status' => 'active',
                'subtotal_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
                'starts_at' => now(),
                'ends_at' => now()->addDays(30),
                'metadata' => ['source' => 'automatic_welcome_offer'],
            ]
        );
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;
use PragmaRX\Google2FA\Google2FA;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'login',
        'name',
        'phone',
        'email',
        'password',
        'role',
        'is_banned',
        'banned_until',
        'ban_reason',
        'banned_by',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    protected $hidden = ['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'banned_until' => 'datetime',
        'is_banned' => 'boolean',
        'two_factor_confirmed_at' => 'datetime',
    ];

    public function hasEnabledTwoFactor(): bool
    {
        return filled($this->two_factor_secret) && ! is_null($this->two_factor_confirmed_at);
    }

    public function generateTwoFactorSecret(): string
    {
        $secret = (new Google2FA())->generateSecretKey(32);

        $this->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_confirmed_at' => null,
            'two_factor_recovery_codes' => null,
        ])->save();

        return $secret;
    }

    public function getTwoFactorQrCodeUrl(string $secret, string $companyName = 'NashFit'): string
    {
        return (new Google2FA())->getQRCodeUrl(
            $companyName,
            $this->email ?: $this->login,
            $secret
        );
    }

    public function verifyTwoFactorCode(string $code): bool
    {
        if (! $this->two_factor_secret) {
            return false;
        }

        $digits = preg_replace('/\D+/', '', $code);
        if (strlen($digits) !== 6) {
            return false;
        }

        return (new Google2FA())->verifyKey($this->two_factor_secret, $digits, 2);
    }

    public function confirmTwoFactor(): void
    {
        $this->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();
    }

    public function disableTwoFactor(): void
    {
        $this->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
    }

    public function generateRecoveryCodes(): array
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $codes = [];

        for ($i = 0; $i < 8; $i++) {
            $code = '';
            for ($j = 0; $j < 8; $j++) {
                $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }
            $codes[] = $code;
        }

        $this->forceFill([
            'two_factor_recovery_codes' => json_encode(array_map(fn ($code) => Hash::make($code), $codes)),
        ])->save();

        return $codes;
    }

    public function recoveryCodesForDisplayCount(): int
    {
        if (! $this->two_factor_recovery_codes) {
            return 0;
        }

        $codes = json_decode($this->two_factor_recovery_codes, true);
        return is_array($codes) ? count($codes) : 0;
    }

    public function verifyRecoveryCode(string $code): bool
    {
        if (! $this->two_factor_recovery_codes) {
            return false;
        }

        $input = strtoupper(preg_replace('/[^A-Z0-9]+/', '', $code));
        if ($input === '') {
            return false;
        }

        $codes = json_decode($this->two_factor_recovery_codes, true);
        if (! is_array($codes)) {
            return false;
        }

        foreach ($codes as $index => $stored) {
            $stored = (string) $stored;
            $matchesHashed = str_starts_with($stored, '$2y$') || str_starts_with($stored, '$argon');
            $ok = $matchesHashed
                ? Hash::check($input, $stored)
                : hash_equals(strtoupper(preg_replace('/[^A-Z0-9]+/', '', $stored)), $input);

            if ($ok) {
                unset($codes[$index]);
                $this->forceFill([
                    'two_factor_recovery_codes' => json_encode(array_values($codes)),
                ])->save();
                return true;
            }
        }

        return false;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTrainer(): bool
    {
        return $this->role === 'trainer';
    }

    public function trainerProfile()
    {
        return $this->hasOne(Trainer::class);
    }

    public function programProgresses()
    {
        return $this->hasMany(ProgramProgress::class);
    }

    public function articles()
    {
        return $this->hasMany(Article::class, 'author_user_id');
    }

    public function favoriteArticles()
    {
        return $this->belongsToMany(Article::class, 'article_favorites')->withTimestamps();
    }

    public function helpfulArticles()
    {
        return $this->belongsToMany(Article::class, 'article_helpful_votes')->withTimestamps();
    }

    public function memberships()
    {
        return $this->hasMany(UserMembership::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function notifications()
    {
        return $this->hasMany(UserNotification::class);
    }

    public function activityEvents()
    {
        return $this->hasMany(ActivityEvent::class);
    }

    public function promoRedemptions()
    {
        return $this->hasMany(PromoRedemption::class);
    }

    public function favoriteProducts()
    {
        return $this->belongsToMany(Product::class, 'product_wishlists')->withTimestamps();
    }

    public function viewedProducts()
    {
        return $this->hasMany(ProductView::class);
    }

    public function addresses()
    {
        return $this->hasMany(UserAddress::class);
    }

    public function isBanned(): bool
    {
        if (! $this->is_banned) {
            return false;
        }

        if ($this->banned_until && $this->banned_until->isPast()) {
            $this->unban();
            return false;
        }

        return true;
    }

    public function ban(?string $reason = null, $durationDays = null, ?int $bannedBy = null): void
    {
        $this->forceFill([
            'is_banned' => true,
            'ban_reason' => $reason,
            'banned_until' => $durationDays ? now()->addDays($durationDays) : null,
            'banned_by' => $bannedBy,
        ])->save();
    }

    public function unban(): void
    {
        $this->forceFill([
            'is_banned' => false,
            'ban_reason' => null,
            'banned_until' => null,
            'banned_by' => null,
        ])->save();
    }

    public function getBanRemainingDays(): ?int
    {
        if (! $this->banned_until) {
            return null;
        }

        return max(0, now()->diffInDays($this->banned_until, false));
    }

    public function bannedBy()
    {
        return $this->belongsTo(User::class, 'banned_by');
    }
}

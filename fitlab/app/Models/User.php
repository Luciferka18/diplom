<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    protected $hidden = ['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'two_factor_confirmed_at' => 'datetime',
    ];

    /**
     * Проверка включен ли 2FA
     */
    public function hasEnabledTwoFactor(): bool
    {
        return !is_null($this->two_factor_secret) && !is_null($this->two_factor_confirmed_at);
    }

    /**
     * Генерация секретного ключа для 2FA
     */
    public function generateTwoFactorSecret(): string
    {
        $google2fa = new \PragmaRX\Google2FA\Google2FA();
        $secret = $google2fa->generateSecretKey();
        
        $this->forceFill([
            'two_factor_secret' => $secret,
        ])->save();
        
        return $secret;
    }

    /**
     * Получить QR-код для 2FA
     */
    public function getTwoFactorQrCodeUrl(string $secret, string $companyName = 'FitLab'): string
    {
        $google2fa = new \PragmaRX\Google2FA\Google2FA();
        return $google2fa->getQRCodeUrl(
            $companyName,
            $this->email ?? $this->login,
            $secret
        );
    }

    /**
     * Проверка 2FA кода
     */
    public function verifyTwoFactorCode(string $code): bool
    {
        if (!$this->two_factor_secret) {
            return false;
        }

        $google2fa = new \PragmaRX\Google2FA\Google2FA();
        return $google2fa->verifyKey($this->two_factor_secret, $code);
    }

    /**
     * Подтверждение включения 2FA
     */
    public function confirmTwoFactor(): void
    {
        $this->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();
    }

    /**
     * Отключение 2FA
     */
    public function disableTwoFactor(): void
    {
        $this->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
    }

    /**
     * Генерация кодов восстановления
     */
    public function generateRecoveryCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 8));
        }
        
        $this->forceFill([
            'two_factor_recovery_codes' => json_encode($codes),
        ])->save();
        
        return $codes;
    }

    /**
     * Проверка кода восстановления
     */
    public function verifyRecoveryCode(string $code): bool
    {
        if (!$this->two_factor_recovery_codes) {
            return false;
        }

        $codes = json_decode($this->two_factor_recovery_codes, true);
        $index = array_search($code, $codes);
        
        if ($index === false) {
            return false;
        }

        // Удаляем использованный код
        unset($codes[$index]);
        $this->forceFill([
            'two_factor_recovery_codes' => json_encode(array_values($codes)),
        ])->save();

        return true;
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
}

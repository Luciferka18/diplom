<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'payable_type', 'payable_id', 'provider', 'status', 'amount', 'currency',
        'external_id', 'idempotency_key', 'metadata', 'paid_at', 'failed_at',
    ];

    protected $casts = ['metadata' => 'array', 'paid_at' => 'datetime', 'failed_at' => 'datetime'];

    public function user() { return $this->belongsTo(User::class); }
    public function payable() { return $this->morphTo(); }
}

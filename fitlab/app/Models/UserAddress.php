<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    protected $fillable = ['user_id', 'label', 'recipient_name', 'phone', 'city', 'address_line', 'postal_code', 'is_default'];
    protected $casts = ['is_default' => 'boolean'];
    public function user() { return $this->belongsTo(User::class); }
}

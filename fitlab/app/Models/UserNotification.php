<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNotification extends Model
{
    protected $fillable = [
        'user_id', 'actor_id', 'type', 'title', 'body', 'message', 'action_url', 'icon', 'data', 'payload', 'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'payload' => 'array',
        'read_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (UserNotification $notification) {
            if (!$notification->message && $notification->body) {
                $notification->message = $notification->body;
            }

            if (!$notification->body && $notification->message) {
                $notification->body = $notification->message;
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}

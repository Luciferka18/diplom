<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GymLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'schedule',
        'phone',
        'map_embed_url',
    ];
}



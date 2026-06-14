<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GymLocation;
use Illuminate\Support\Facades\Schema;

class LocationController extends Controller
{
    public function index()
    {
        $query = GymLocation::query();

        if (Schema::hasColumn('gym_locations', 'is_active')) {
            $query->where('is_active', true);
        }

        if (Schema::hasColumn('gym_locations', 'sort_order')) {
            $query->orderBy('sort_order');
        }

        $locations = $query->orderBy('id')->get()->map(fn (GymLocation $location) => $this->locationData($location))->values();

        return response()->json(['data' => $locations]);
    }

    private function locationData(GymLocation $location): array
    {
        return [
            'id' => $location->id,
            'name' => $location->name,
            'address' => $location->address,
            'description' => $location->description,
            'phone' => $location->phone,
            'email' => $location->email,
            'working_hours' => $location->working_hours,
            'weekend_hours' => $location->weekend_hours,
            'features' => $location->features ?: [],
            'latitude' => $location->latitude,
            'longitude' => $location->longitude,
            'map_url' => $location->map_url,
            'is_active' => $location->is_active ?? true,
            'sort_order' => $location->sort_order ?? 0,
        ];
    }
}

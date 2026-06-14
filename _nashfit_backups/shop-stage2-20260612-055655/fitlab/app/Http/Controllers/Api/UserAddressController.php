<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserAddressController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['data' => $request->user()->addresses()->orderByDesc('is_default')->latest()->get()]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $address = DB::transaction(function () use ($request, $data) {
            if ($data['is_default'] ?? false) $request->user()->addresses()->update(['is_default' => false]);
            return $request->user()->addresses()->create($data);
        });
        return response()->json(['data' => $address], 201);
    }

    public function update(Request $request, UserAddress $address)
    {
        abort_unless((int) $address->user_id === (int) $request->user()->id, 403);
        $data = $this->validated($request, true);
        DB::transaction(function () use ($request, $address, $data) {
            if ($data['is_default'] ?? false) $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
            $address->update($data);
        });
        return response()->json(['data' => $address->fresh()]);
    }

    public function destroy(Request $request, UserAddress $address)
    {
        abort_unless((int) $address->user_id === (int) $request->user()->id, 403);
        $address->delete();
        return response()->json(['message' => 'Адрес удалён.']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        return $request->validate([
            'label' => ['nullable', 'string', 'max:100'],
            'recipient_name' => [$required, 'string', 'max:255'],
            'phone' => [$required, 'string', 'max:50'],
            'city' => [$required, 'string', 'max:255'],
            'address_line' => [$required, 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:32'],
            'is_default' => ['nullable', 'boolean'],
        ]);
    }
}

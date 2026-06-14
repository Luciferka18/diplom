<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DiscountService;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    public function validateCode(Request $request, DiscountService $discounts)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:64'],
            'target' => ['required', 'in:membership,booking,store'],
            'subtotal' => ['required', 'integer', 'min:0'],
        ]);
        $result = $discounts->calculate($request->user(), $data['code'], $data['target'], $data['subtotal']);
        return response()->json([
            'valid' => true,
            'code' => $result['promo_code']->code,
            'description' => $result['promo_code']->description,
            'discount_amount' => $result['discount'],
            'total_amount' => $result['total'],
        ]);
    }
}

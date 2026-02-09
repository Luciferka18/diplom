<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'currency' => $this->currency,
            'total_amount' => $this->total_amount,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'customer_email' => $this->customer_email,
            'items' => $this->whenLoaded('items', fn() => $this->items->map(fn($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'qty' => $item->qty,
                'price_snapshot' => $item->price_snapshot,
                'product' => $item->relationLoaded('product') ? new ProductResource($item->product) : null,
            ])),
            'created_at' => $this->created_at,
        ];
    }
}

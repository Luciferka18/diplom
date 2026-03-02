"use client";

import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function ProductCard({ product }) {
  return (
    <Card className="h-full">
      <div className="flex h-full flex-col">
        <h3 className="font-semibold text-lg">{product.name}</h3>

        {product.description && <p className="text-sm text-white/70 mt-2 line-clamp-3">{product.description}</p>}

        <div className="mt-4 flex items-center justify-between">
          <Badge className="text-emerald-200">{product.price} ₽</Badge>
          <AddToCartButton product={product} />
        </div>

        <Link href={`/shop/${product.id}`} className="mt-4 text-sm text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline">
          Подробнее →
        </Link>
      </div>
    </Card>
  );
}

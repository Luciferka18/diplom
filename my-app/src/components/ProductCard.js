"use client";

import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-lg">{product.name}</h3>

      {product.description && (
        <p className="text-sm text-gray-600 mt-2">
          {product.description}
        </p>
      )}

      <div className="mt-4 flex justify-between items-center">
        <span className="font-bold text-green-700">
          {product.price} ₽
        </span>

        <AddToCartButton product={product} />
      </div>

      <Link
        href={`/shop/${product.id}`}
        className="block mt-3 text-sm text-green-700 hover:underline"
      >
        Подробнее →
      </Link>
    </div>
  );
}

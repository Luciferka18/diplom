"use client";

import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product, className = "" }) {
  const { addToCart } = useCart();

  return (
    <button
      type="button"
      onClick={() => addToCart(product)}
      className={`btn btn-primary ${className}`}
    >
      В корзину
    </button>
  );
}

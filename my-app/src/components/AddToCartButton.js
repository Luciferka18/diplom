"use client";
import { useCart } from "@/context/CartContext";

export function AddToCartButton({ product }) {
  const { addToCart } = useCart();

  return (
    <button className="btn-primary" onClick={() => addToCart(product)}>
      В корзину
    </button>
  );
}

"use client";

import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";

export default function AddToCartButton({ product, className = "" }) {
  const { addToCart } = useCart();

  return (
    <Button type="button" onClick={() => addToCart(product)} className={className} size="sm">
      В корзину
    </Button>
  );
}

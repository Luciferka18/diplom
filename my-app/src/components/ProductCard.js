"use client";

import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="card">
      <h3>{product.title}</h3>
      <p>{product.description}</p>
      <p><b>{product.price} ₽</b></p>
      <button className="button" onClick={() => addToCart(product)}>
        В корзину
      </button>
    </div>
  );
}

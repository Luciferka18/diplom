"use client";

import { Check, Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product, variant = null, quantity = 1, className = "" }) {
  const { addToCart } = useCart();
  const [state, setState] = useState("idle");
  const stock = Number(variant?.stock ?? product?.stock ?? 0);

  async function add(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setState("loading");
    try {
      await addToCart(product, variant, quantity);
      setState("done");
      window.setTimeout(() => setState("idle"), 1200);
    } catch {
      setState("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={stock <= 0 || state === "loading"}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-black text-[color:var(--on-accent)] shadow-[var(--shadow-xs)] transition hover:bg-[color:var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
    >
      {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "done" ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {stock <= 0 ? "Нет в наличии" : state === "done" ? "Добавлено" : "В корзину"}
    </button>
  );
}

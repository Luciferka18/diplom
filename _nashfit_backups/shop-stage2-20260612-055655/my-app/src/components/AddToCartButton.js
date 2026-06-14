"use client";

import { useState } from "react";
import { ShoppingCart, Loader2, Check } from "lucide-react";
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
      setTimeout(() => setState("idle"), 1200);
    } catch {
      setState("idle");
    }
  }

  return (
    <button type="button" onClick={add} disabled={stock <= 0 || state === "loading"} className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45 ${className}`}>
      {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "done" ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {stock <= 0 ? "Нет в наличии" : state === "done" ? "Добавлено" : "В корзину"}
    </button>
  );
}

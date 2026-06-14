"use client";

import Link from "next/link";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const money = (value) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, totalPrice } = useCart();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button className="absolute inset-0 bg-[color:var(--overlay)] backdrop-blur-sm" onClick={onClose} aria-label="Закрыть корзину" />
      <aside className="absolute right-0 top-0 flex h-full w-[min(94vw,430px)] flex-col border-l border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 shadow-[var(--shadow-lg)] sm:p-6">
        <div className="flex items-center justify-between border-b border-[color:var(--stroke)] pb-4">
          <div>
            <div className="nf-eyebrow">Ваш заказ</div>
            <h2 className="mt-1 text-2xl font-black">Корзина</h2>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--panel-2)] text-[color:var(--text)]" aria-label="Закрыть"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-5">
          {cart.length === 0 ? (
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent)]"><ShoppingBag size={22} /></span>
                <p className="mt-4 font-bold">Корзина пока пуста</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Выберите товары для тренировок и восстановления.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.key || item.id} className="flex gap-3 rounded-[18px] border border-[color:var(--stroke)] bg-[color:var(--panel-2)] p-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[13px] bg-[color:var(--bg2)]">
                    {item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{item.title}</p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">{item.quantity} × {money(item.price)}</p>
                  </div>
                  <button className="grid h-9 w-9 place-items-center rounded-full text-[color:var(--danger)] hover:bg-[color:var(--danger-soft)]" onClick={() => removeFromCart(item.key || item.id)} aria-label="Удалить товар"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[color:var(--stroke)] pt-5">
          <div className="mb-4 flex items-end justify-between">
            <span className="text-sm font-bold text-[color:var(--muted)]">Итого</span>
            <span className="text-2xl font-black tracking-[-0.04em]">{money(totalPrice)}</span>
          </div>
          <Link href="/cart" onClick={onClose} className="flex min-h-12 items-center justify-center rounded-full bg-[color:var(--accent)] px-5 font-black text-[color:var(--on-accent)] transition hover:bg-[color:var(--accent-hover)]">Перейти в корзину</Link>
        </div>
      </aside>
    </div>
  );
}

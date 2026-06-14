"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, Minus, Plus, Trash2, ShoppingBag, Truck, TicketPercent, ArrowRight, PackageCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/services/api";
import ProductCard from "@/components/ProductCard";

const money = (value) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));
const FREE_DELIVERY = 5000;

export default function CartPage() {
  const { cart, removeFromCart, clearCart, setQuantity, totalCount, totalPrice, loadingCart } = useCart();
  const { isAuthed } = useAuth();
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("nashfit_store_promo") : "";
    if (stored) setPromo(stored);
    apiGet("/products?trainer_pick=1&available=1&per_page=4").then((response) => setRecommendations(response?.data || [])).catch(() => {});
  }, []);

  const remaining = Math.max(0, FREE_DELIVERY - totalPrice);
  const progress = Math.min(100, (totalPrice / FREE_DELIVERY) * 100);
  const totalAfterDiscount = Math.max(0, totalPrice - discount);

  async function applyPromo() {
    setPromoError(""); setPromoMessage(""); setPromoBusy(true);
    try {
      if (!isAuthed) throw new Error("Войдите, чтобы применить промокод.");
      const response = await apiPost("/promo-codes/validate", { code: promo.trim(), target: "store", subtotal: Math.round(totalPrice * 100) });
      setDiscount(Number(response.discount_amount || 0) / 100);
      setPromoMessage(`Промокод применён: скидка ${money(Number(response.discount_amount || 0) / 100)}`);
      localStorage.setItem("nashfit_store_promo", promo.trim().toUpperCase());
    } catch (e) {
      setDiscount(0);
      setPromoError(e?.data?.errors?.promo_code?.[0] || e?.data?.message || e?.message || "Промокод не подошёл.");
    } finally { setPromoBusy(false); }
  }

  async function moveToFavorites(item) {
    if (!isAuthed) { window.location.href = "/login?next=/cart"; return; }
    await apiPost(`/products/${item.productId}/favorite`, {});
    await removeFromCart(item.key);
  }

  if (loadingCart) return <main className="container-fitlab py-12"><div className="h-96 animate-pulse rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)]" /></main>;

  if (!cart.length) return (
    <main className="container-fitlab py-16">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-10 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[color:var(--accent-soft)]"><ShoppingBag className="h-9 w-9 text-[color:var(--accent)]" /></div>
        <h1 className="mt-6 text-3xl font-black text-[color:var(--text)]">Корзина пока пустая</h1>
        <p className="mt-3 text-[color:var(--muted)]">Добавьте товары из каталога — варианты и количество сохранятся.</p>
        <Link href="/shop" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 py-3 font-black text-[color:var(--on-accent)]">Перейти в магазин <ArrowRight className="h-5 w-5" /></Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[color:var(--bg)] pb-20 pt-10">
      <div className="container-fitlab">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[.18em] text-[color:var(--accent)]">Покупки</div><h1 className="mt-1 text-4xl font-black text-[color:var(--text)]">Корзина</h1><p className="mt-2 text-[color:var(--muted)]">{totalCount} товаров на сумму {money(totalPrice)}</p></div><button onClick={() => window.confirm("Очистить корзину?") && clearCart()} className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--danger)]"><Trash2 className="h-4 w-4" /> Очистить</button></div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_390px]">
          <section className="space-y-4">
            {cart.map((item) => (
              <article key={item.key} className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 md:p-5">
                <div className="grid gap-4 sm:grid-cols-[130px_1fr]">
                  <Link href={`/shop/${item.productId}`} className="aspect-square overflow-hidden rounded-2xl bg-slate-900">{item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" /> : null}</Link>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold uppercase tracking-wider text-[color:var(--accent)]">{item.brand || item.category || "НашФит"}</div><Link href={`/shop/${item.productId}`} className="mt-1 block text-xl font-black text-[color:var(--text)] hover:text-[color:var(--accent-hover)]">{item.name}</Link>{item.variant ? <div className="mt-2 flex flex-wrap gap-2">{Object.entries(item.variant.options || {}).map(([key,value]) => <span key={key} className="rounded-full border border-[color:var(--stroke)] px-2.5 py-1 text-xs text-[color:var(--muted)]">{key}: {value}</span>)}</div> : null}</div><button onClick={() => removeFromCart(item.key)} className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--stroke)] text-[color:var(--muted)] hover:border-red-400/40 hover:text-[color:var(--danger)]"><Trash2 className="h-4 w-4" /></button></div>
                    <div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div className="flex items-center rounded-xl border border-[color:var(--stroke)]"><button onClick={() => setQuantity(item.key, item.quantity - 1)} className="grid h-10 w-10 place-items-center text-[color:var(--text)]"><Minus className="h-4 w-4" /></button><span className="w-12 text-center font-black text-[color:var(--text)]">{item.quantity}</span><button onClick={() => setQuantity(item.key, item.quantity + 1)} className="grid h-10 w-10 place-items-center text-[color:var(--text)]"><Plus className="h-4 w-4" /></button></div><div className="text-right"><div className="text-sm text-[color:var(--muted)]">{money(item.price)} × {item.quantity}</div><div className="text-xl font-black text-[color:var(--text)]">{money(item.price * item.quantity)}</div></div></div>
                    <button onClick={() => moveToFavorites(item)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)] hover:text-rose-400"><Heart className="h-4 w-4" /> Сохранить на потом</button>
                  </div>
                </div>
              </article>
            ))}
            <Link href="/shop" className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--stroke)] px-5 py-3 font-bold text-[color:var(--text)] hover:border-[color:var(--accent-border)]">← Продолжить покупки</Link>
          </section>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6">
              <h2 className="text-xl font-black text-[color:var(--text)]">Ваш заказ</h2>
              <div className="mt-5 rounded-2xl border border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[color:var(--accent)]"><Truck className="h-4 w-4" /> {remaining > 0 ? `До бесплатной доставки ${money(remaining)}` : "Доставка будет бесплатной"}</div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-950/40"><div className="h-full rounded-full bg-[color:var(--accent)] transition-all" style={{ width: `${progress}%` }} /></div>
              </div>

              <div className="mt-5"><label className="text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">Промокод</label><div className="mt-2 flex gap-2"><input value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} placeholder="START10" className="min-w-0 flex-1 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 font-bold uppercase text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]" /><button onClick={applyPromo} disabled={!promo.trim() || promoBusy} className="rounded-xl border border-[color:var(--accent-border)] px-4 font-bold text-[color:var(--accent)] disabled:opacity-40">Применить</button></div>{promoMessage ? <div className="mt-2 text-xs text-[color:var(--accent)]">{promoMessage}</div> : null}{promoError ? <div className="mt-2 text-xs text-[color:var(--danger)]">{promoError}</div> : null}</div>

              <div className="mt-6 space-y-3 border-t border-[color:var(--stroke)] pt-5 text-sm"><div className="flex justify-between text-[color:var(--muted)]"><span>Товары</span><b className="text-[color:var(--text)]">{money(totalPrice)}</b></div>{discount > 0 ? <div className="flex justify-between text-[color:var(--accent)]"><span>Скидка</span><b>−{money(discount)}</b></div> : null}<div className="flex justify-between text-[color:var(--muted)]"><span>Доставка</span><b className="text-[color:var(--text)]">Рассчитаем при оформлении</b></div><div className="flex justify-between border-t border-[color:var(--stroke)] pt-4 text-xl"><span className="font-black text-[color:var(--text)]">Итого</span><b className="text-[color:var(--accent)]">{money(totalAfterDiscount)}</b></div></div>
              <Link href="/checkout" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3.5 font-black text-[color:var(--on-accent)] hover:bg-[color:var(--accent-hover)]">Перейти к оформлению <ArrowRight className="h-5 w-5" /></Link>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[color:var(--muted)]"><PackageCheck className="h-4 w-4" /> Остатки проверятся перед оплатой</div>
            </div>
          </aside>
        </div>
      </div>
      {recommendations.length ? <section className="container-fitlab mt-14"><div className="text-xs font-black uppercase tracking-wider text-[color:var(--secondary)]">Рекомендации тренеров</div><h2 className="mt-1 text-3xl font-black text-[color:var(--text)]">Добавить к заказу</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recommendations.map((product) => <ProductCard key={product.id} product={product} compact />)}</div></section> : null}
    </main>
  );
}

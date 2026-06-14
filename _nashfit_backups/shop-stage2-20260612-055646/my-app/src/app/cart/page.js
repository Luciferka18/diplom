"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";

function rub(n) {
  const v = Number(n || 0);
  return v.toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
}

function clampQty(v) {
  const num = Number(String(v).replace(",", "."));
  if (!Number.isFinite(num)) return 1;
  return Math.max(1, Math.floor(num));
}

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    clearCart,
    setQuantity,
    totalCount,
    totalPrice,
    loadingCart,
  } = useCart();

  const items = cart || [];

  const computed = useMemo(() => {
    const count =
      typeof totalCount === "number"
        ? totalCount
        : items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

    const sum =
      typeof totalPrice === "number"
        ? totalPrice
        : items.reduce(
            (s, i) =>
              s + (Number(i.price || 0) * (Number(i.quantity) || 0)),
            0
          );

    return { count, sum };
  }, [items, totalCount, totalPrice]);

  if (loadingCart) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Корзина
        </h1>
        <p className="mt-2 text-sm text-white/70">Загрузка…</p>

        <div className="mt-6 space-y-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 rounded-3xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </main>
    );
  }

  if (!items || items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Корзина
        </h1>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-white/10" />
          <h2 className="text-xl font-semibold text-white">Корзина пустая</h2>
          <p className="mt-1 text-white/70">
            Добавь товары из магазина — они появятся здесь.
          </p>

          <div className="mt-6">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-white/90"
            >
              Перейти в магазин
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Корзина
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
          <span>
            Товаров: <b className="text-white">{computed.count}</b>
          </span>
          <span>
            Сумма: <b className="text-white">{rub(computed.sum)}</b>
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT: items */}
        <section className="space-y-4">
          {items.map((item) => {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;

            return (
              <article
                key={item.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
              >
                <div className="flex gap-4">
                  {/* image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                    {item.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.photo_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0" />
                    )}
                  </div>

                  {/* content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-white">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-white/70">
                          Цена:{" "}
                          <span className="text-white/90">{rub(price)}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
                        title="Удалить"
                      >
                        Удалить
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      {/* qty */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">Кол-во</span>

                        <div className="flex items-center rounded-2xl border border-white/10 bg-white/5">
                          <button
                            onClick={() => setQuantity(item.id, qty - 1)}
                            className="h-10 w-10 rounded-2xl text-white/80 hover:bg-white/10 hover:text-white"
                            aria-label="Уменьшить"
                          >
                            −
                          </button>

                          <input
                            className="h-10 w-16 bg-transparent text-center text-sm font-semibold text-white outline-none"
                            value={qty}
                            inputMode="numeric"
                            onChange={(e) =>
                              setQuantity(item.id, clampQty(e.target.value))
                            }
                          />

                          <button
                            onClick={() => setQuantity(item.id, qty + 1)}
                            className="h-10 w-10 rounded-2xl text-white/80 hover:bg-white/10 hover:text-white"
                            aria-label="Увеличить"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* line total */}
                      <div className="text-sm text-white/70">
                        Итого за товар:{" "}
                        <b className="text-white">{rub(price * qty)}</b>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={clearCart}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            >
              Очистить корзину
            </button>

            <Link
              href="/shop"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-white/90"
            >
              Продолжить покупки
            </Link>
          </div>
        </section>

        {/* RIGHT: summary */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">Итого</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-white/70">
                <span>Товары</span>
                <span className="text-white">{computed.count}</span>
              </div>

              <div className="flex items-center justify-between text-white/70">
                <span>Сумма</span>
                <span className="text-white">{rub(computed.sum)}</span>
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex items-end justify-between">
                <span className="text-white/70">К оплате</span>
                <span className="text-xl font-extrabold text-white">
                  {rub(computed.sum)}
                </span>
              </div>
            </div>

            <button
              className="mt-5 w-full rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-extrabold text-slate-950 hover:bg-emerald-300">
                <Link href="/checkout">
                Перейти к оформлению
                </Link>
            </button>

            <p className="mt-3 text-xs text-white/50">
              
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
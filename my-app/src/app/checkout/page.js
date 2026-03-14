"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function rubFromKopecks(k) {
  const rub = Number(k || 0) / 100;
  return rub.toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
}

function rubFromNumber(n) {
  const v = Number(n || 0);
  return v.toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, totalCount, totalPrice } = useCart();

  const items = cart || [];

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    address_line: "",
    city: "",
    postal_code: "",
    comment: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    // На фронте totalPrice у тебя может быть в рублях (как раньше было 2490.00),
    // а на бэке мы храним копейки. Для UI оставляем как есть:
    const count =
      typeof totalCount === "number"
        ? totalCount
        : items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

    const sum =
      typeof totalPrice === "number"
        ? totalPrice
        : items.reduce((s, i) => s + (Number(i.price || 0) * (Number(i.quantity) || 0)), 0);

    return { count, sum };
  }, [items, totalCount, totalPrice]);

  const canSubmit = useMemo(() => {
    if (!items.length) return false;
    if (!form.customer_name.trim()) return false;
    if (!form.customer_phone.trim()) return false;
    return true;
  }, [items.length, form.customer_name, form.customer_phone]);

  async function submitOrder(e) {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Заполни имя и телефон, и проверь, что корзина не пустая.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({
          product_id: i.id,
          quantity: Number(i.quantity) || 1,
        })),
        ...form,
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Laravel validation errors
        if (res.status === 422 && json?.errors) {
          const firstKey = Object.keys(json.errors)[0];
          const firstMsg = json.errors[firstKey]?.[0] || "Ошибка валидации.";
          throw new Error(firstMsg);
        }
        throw new Error(json?.message || `Ошибка оформления (HTTP ${res.status})`);
      }

      const orderId = json?.order?.id;
      clearCart?.();

      if (orderId) {
        router.push(`/order-success?orderId=${orderId}`);
      } else {
        router.push(`/order-success`);
      }
    } catch (err) {
      setError(err?.message || "Не удалось оформить заказ.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!items.length) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Оформление</h1>
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
          <h2 className="text-xl font-semibold text-white">Корзина пустая</h2>
          <p className="mt-1 text-white/70">Сначала добавь товары в корзину.</p>
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
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Оформление</h1>
        <p className="mt-2 text-sm text-white/70">
          Заполни данные — и мы создадим заказ в системе.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* FORM */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <form onSubmit={submitOrder} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Имя*"
                value={form.customer_name}
                onChange={(v) => setForm((p) => ({ ...p, customer_name: v }))}
                placeholder="Иван"
              />
              <Field
                label="Телефон*"
                value={form.customer_phone}
                onChange={(v) => setForm((p) => ({ ...p, customer_phone: v }))}
                placeholder="+7..."
              />
            </div>

            <Field
              label="Email"
              value={form.customer_email}
              onChange={(v) => setForm((p) => ({ ...p, customer_email: v }))}
              placeholder="you@mail.com"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Город"
                value={form.city}
                onChange={(v) => setForm((p) => ({ ...p, city: v }))}
                placeholder="Москва"
              />
              <Field
                label="Индекс"
                value={form.postal_code}
                onChange={(v) => setForm((p) => ({ ...p, postal_code: v }))}
                placeholder="000000"
              />
            </div>

            <Field
              label="Адрес"
              value={form.address_line}
              onChange={(v) => setForm((p) => ({ ...p, address_line: v }))}
              placeholder="Улица, дом, квартира"
            />

            <TextArea
              label="Комментарий"
              value={form.comment}
              onChange={(v) => setForm((p) => ({ ...p, comment: v }))}
              placeholder="Например: позвонить за 10 минут"
            />

            {error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-extrabold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Оформляем..." : "Оформить заказ"}
              </button>

              <Link
                href="/cart"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
              >
                Вернуться в корзину
              </Link>
            </div>
          </form>
        </section>

        {/* SUMMARY */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">Ваш заказ</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-white/70">
                <span>Товары</span>
                <span className="text-white">{summary.count}</span>
              </div>

              <div className="flex items-center justify-between text-white/70">
                <span>Сумма</span>
                {/* totalPrice у тебя на фронте в рублях, поэтому форматируем как рубли */}
                <span className="text-white">{rubFromNumber(summary.sum)}</span>
              </div>

              <div className="h-px bg-white/10" />

              <div className="space-y-2">
                {items.map((i) => (
                  <div key={i.id} className="flex items-start justify-between gap-3 text-white/70">
                    <span className="line-clamp-2">
                      {i.name} <span className="text-white/40">× {i.quantity}</span>
                    </span>
                    <span className="shrink-0 text-white">
                      {rubFromNumber((Number(i.price) || 0) * (Number(i.quantity) || 0))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/*
            <p className="mt-3 text-xs text-white/50">
              Итоговая сумма пересчитывается на сервере.
            </p> */}
          </div>    
        </aside>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-semibold text-white/80">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-semibold text-white/80">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
      />
    </label>
  );
}
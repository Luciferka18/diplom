"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { apiPost } from "@/services/api";

function rubFromNumber(n) {
  const value = Number(n || 0);
  return value.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
  });
}

function getErrorMessage(error) {
  if (error?.data?.errors) {
    const firstKey = Object.keys(error.data.errors)[0];
    const firstValue = error.data.errors[firstKey];

    if (Array.isArray(firstValue)) {
      return firstValue[0] || "Ошибка валидации.";
    }

    return String(firstValue || "Ошибка валидации.");
  }

  return error?.data?.message || error?.message || "Не удалось оформить заказ.";
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
    const count =
      typeof totalCount === "number"
        ? totalCount
        : items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    const sum =
      typeof totalPrice === "number"
        ? totalPrice
        : items.reduce(
            (sum, item) =>
              sum + Number(item.price || 0) * Number(item.quantity || 0),
            0
          );

    return { count, sum };
  }, [items, totalCount, totalPrice]);

  const canSubmit = useMemo(() => {
    if (!items.length) return false;
    if (!form.customer_name.trim()) return false;
    if (!form.customer_phone.trim()) return false;

    return true;
  }, [items.length, form.customer_name, form.customer_phone]);

  async function submitOrder(event) {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Заполни имя и телефон, и проверь, что корзина не пустая.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        items: items.map((item) => ({
          product_id: item.id,
          quantity: Number(item.quantity) || 1,
        })),
        ...form,
      };

      const data = await apiPost("/orders", payload);

      const orderId = data?.order?.id ?? data?.data?.id ?? data?.id;

      await clearCart?.();

      if (orderId) {
        router.push(`/order-success?orderId=${orderId}`);
      } else {
        router.push("/order-success");
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (!items.length) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Оформление
        </h1>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
          <h2 className="text-xl font-semibold text-white">Корзина пустая</h2>

          <p className="mt-1 text-white/70">
            Сначала добавь товары в корзину.
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
          Оформление
        </h1>

        <p className="mt-2 text-sm text-white/70">
          Заполни данные — и мы создадим заказ в системе.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <form onSubmit={submitOrder} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Имя*"
                value={form.customer_name}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, customer_name: value }))
                }
                placeholder="Иван"
              />

              <Field
                label="Телефон*"
                value={form.customer_phone}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, customer_phone: value }))
                }
                placeholder="+7..."
              />
            </div>

            <Field
              label="Email"
              value={form.customer_email}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, customer_email: value }))
              }
              placeholder="you@mail.com"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Город"
                value={form.city}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, city: value }))
                }
                placeholder="Москва"
              />

              <Field
                label="Индекс"
                value={form.postal_code}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, postal_code: value }))
                }
                placeholder="000000"
              />
            </div>

            <Field
              label="Адрес"
              value={form.address_line}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, address_line: value }))
              }
              placeholder="Улица, дом, квартира"
            />

            <TextArea
              label="Комментарий"
              value={form.comment}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, comment: value }))
              }
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
                <span className="text-white">{rubFromNumber(summary.sum)}</span>
              </div>

              <div className="h-px bg-white/10" />

              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 text-white/70"
                  >
                    <span className="line-clamp-2">
                      {item.name}{" "}
                      <span className="text-white/40">× {item.quantity}</span>
                    </span>

                    <span className="shrink-0 text-white">
                      {rubFromNumber(
                        Number(item.price || 0) * Number(item.quantity || 0)
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
        onChange={(event) => onChange(event.target.value)}
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
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
      />
    </label>
  );
}
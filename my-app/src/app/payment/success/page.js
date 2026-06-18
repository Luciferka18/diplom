"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { CheckCircle2, Loader2 } from "lucide-react";

function isPaid(payment) {
  return payment?.status === "paid" || payment?.status === "succeeded";
}

export default function PaymentSuccessPage() {
  const { clearCart, clearLocalCart, refreshCart } = useCart();
  const clearedRef = useRef(false);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Проверяем статус платежа...");

  const clearPaidCart = useCallback(async () => {
    if (clearedRef.current) return;
    clearedRef.current = true;

    try {
      await clearCart?.();
    } catch (error) {
      console.warn("Failed to clear server cart after payment", error);
    }

    try {
      clearLocalCart?.();
      localStorage.removeItem("nashfit_cart_v2");
      localStorage.removeItem("cart");
      localStorage.removeItem("nashfit_store_promo");
    } catch {}

    try {
      await refreshCart?.();
    } catch {}
  }, [clearCart, clearLocalCart, refreshCart]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment_id");

    if (!paymentId) {
      clearPaidCart().finally(() => {
        setStatus("ok");
        setMessage("Если оплата прошла успешно, корзина очищена, а статус обновится в личном кабинете.");
      });
      return;
    }

    apiPost(`/payments/${paymentId}/yookassa-refresh`, {})
      .then(async (response) => {
        const payment = response?.data || response;
        if (isPaid(payment)) {
          await clearPaidCart();
          setStatus("ok");
          setMessage("Оплата прошла успешно. Оплаченные товары удалены из корзины, заказ обновлён в личном кабинете.");
        } else {
          setStatus("pending");
          setMessage("Платёж создан, но ЮKassa ещё подтверждает статус. Обновите страницу через несколько секунд.");
        }
      })
      .catch(() => {
        apiGet(`/payments/${paymentId}`).then(async (response) => {
          const payment = response?.data || response;
          if (isPaid(payment)) {
            await clearPaidCart();
            setStatus("ok");
            setMessage("Оплата прошла успешно. Оплаченные товары удалены из корзины.");
          } else {
            setStatus("pending");
            setMessage("Статус платежа можно проверить в личном кабинете.");
          }
        }).catch(() => {
          setStatus("pending");
          setMessage("Не удалось проверить статус автоматически. Проверьте заказ в личном кабинете.");
        });
      });
  }, [clearPaidCart]);

  return (
    <main className="container-fitlab py-16">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-8 text-center">
        {status === "loading" ? <Loader2 className="mx-auto h-14 w-14 animate-spin text-[color:var(--accent)]" /> : <CheckCircle2 className="mx-auto h-14 w-14 text-[color:var(--accent)]" />}
        <h1 className="mt-5 text-3xl font-black text-[color:var(--text)]">Оплата ЮKassa</h1>
        <p className="mt-3 text-[color:var(--muted)]">{message}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/account/orders" className="rounded-xl bg-[color:var(--accent)] px-5 py-3 font-black text-[color:var(--on-accent)]">Мои заказы</Link>
          <Link href="/shop" className="rounded-xl border border-[color:var(--stroke)] px-5 py-3 font-black text-[color:var(--text)]">В магазин</Link>
        </div>
      </div>
    </main>
  );
}

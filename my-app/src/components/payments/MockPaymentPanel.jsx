"use client";

import { useState } from "react";
import { apiPost } from "@/services/api";
import { CreditCard, Loader2, ShieldCheck, XCircle } from "lucide-react";

const money = (kopecks = 0) => new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
}).format(Number(kopecks || 0) / 100);

function statusText(status) {
  if (status === "succeeded" || status === "paid") return "Оплачено";
  if (status === "pending") return "Ожидает оплаты";
  if (status === "waiting_for_capture") return "Ожидает подтверждения";
  if (status === "canceled") return "Отменено";
  return status || "Новый платеж";
}

export default function MockPaymentPanel({ payment, title = "Оплата", onSuccess, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!payment) return null;

  async function pay() {
    setBusy(true);
    setError("");

    try {
      const successUrl = new URL(`${window.location.origin}/payment/success`);
      successUrl.searchParams.set("payment_id", String(payment.id));

      const response = await apiPost(`/payments/${payment.id}/yookassa`, {
        return_url: successUrl.toString(),
        description: title,
      });

      const confirmationUrl = response?.confirmation_url || response?.data?.confirmation_url;

      if (!confirmationUrl && (response?.data?.status === "paid" || response?.data?.status === "succeeded")) {
        onSuccess?.(response.data);
        return;
      }

      if (!confirmationUrl) {
        throw new Error("ЮKassa не вернула ссылку на оплату.");
      }

      window.location.href = confirmationUrl;
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось создать оплату ЮKassa.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] md:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" /> ЮKassa / ЮMoney
          </div>
          <h2 className="text-2xl font-bold text-[color:var(--text)]">{title}</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Нажмите кнопку — мы откроем защищённую страницу оплаты ЮKassa. После успешной оплаты оплаченные товары автоматически исчезнут из корзины.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-[color:var(--muted)]">К оплате</div>
          <div className="mt-1 text-2xl font-black text-[color:var(--accent)]">{money(payment.amount)}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--accent-soft)]">
              <CreditCard className="h-6 w-6 text-[color:var(--accent)]" />
            </div>
            <div>
              <div className="font-black text-[color:var(--text)]">Платёж #{payment.id}</div>
              <div className="text-sm text-[color:var(--muted)]">{statusText(payment.status)}</div>
            </div>
          </div>
          <div className="text-right text-sm font-bold text-[color:var(--text)]">{money(payment.amount)}</div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-xl border border-[color:var(--stroke)] px-5 py-3 text-sm font-semibold text-[color:var(--muted)] hover:bg-[color:var(--bg)]">
            Вернуться
          </button>
        ) : null}
        <button disabled={busy} onClick={pay} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 font-bold text-[color:var(--on-accent)] transition hover:bg-[color:var(--accent-hover)] disabled:opacity-60">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
          {busy ? "Создаём платёж…" : `Оплатить через ЮKassa ${money(payment.amount)}`}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { apiPost } from "@/services/api";
import { CreditCard, LockKeyhole, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

const money = (kopecks = 0) => new Intl.NumberFormat("ru-RU", {
  style: "currency", currency: "RUB", maximumFractionDigits: 0,
}).format(Number(kopecks || 0) / 100);

function digits(value, max) {
  return String(value || "").replace(/\D/g, "").slice(0, max);
}

export default function MockPaymentPanel({ payment, title = "Оплата", onSuccess, onCancel }) {
  const [card, setCard] = useState("4242424242424242");
  const [holder, setHolder] = useState("ИВАН ИВАНОВ");
  const [expiry, setExpiry] = useState("12/30");
  const [cvc, setCvc] = useState("123");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(payment?.status === "paid");
  const [error, setError] = useState("");

  const formattedCard = useMemo(() => digits(card, 16).replace(/(.{4})/g, "$1 ").trim(), [card]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    const raw = digits(card, 16);
    if (raw.length !== 16 || digits(cvc, 3).length !== 3 || !/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Проверьте номер карты, срок действия и CVC.");
      return;
    }
    setBusy(true);
    try {
      const response = await apiPost(`/payments/${payment.id}/mock-confirm`, {
        cardholder: holder.trim() || "CARD HOLDER",
        last4: raw.slice(-4),
      }, { headers: { "Idempotency-Key": crypto.randomUUID() } });
      setDone(true);
      setTimeout(() => onSuccess?.(response?.data || response), 450);
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось выполнить демонстрационную оплату.");
    } finally {
      setBusy(false);
    }
  }

  if (!payment) return null;

  return (
    <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] md:p-7 dark:border-emerald-400/25 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40 dark:shadow-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-4 w-4" /> Демо-оплата
          </div>
          <h2 className="text-2xl font-bold text-[color:var(--text)] dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)] dark:text-white/55">Данные карты не сохраняются. Это безопасная имитация платёжного шлюза.</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-[color:var(--muted)] dark:text-white/45">К оплате</div>
          <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-300">{money(payment.amount)}</div>
        </div>
      </div>

      {done ? (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-8 text-center">
          <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-600 dark:text-emerald-300" />
          <div className="text-xl font-bold text-[color:var(--text)] dark:text-white">Оплата прошла успешно</div>
          <div className="mt-2 text-sm text-[color:var(--muted)] dark:text-white/60">Статус покупки уже обновлён.</div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-5 dark:border-white/10 dark:bg-gradient-to-br dark:from-emerald-500/30 dark:to-cyan-500/10">
            <CreditCard className="absolute right-5 top-5 h-7 w-7 text-[color:var(--muted)] dark:text-white/45" />
            <label className="text-xs uppercase tracking-[.18em] text-[color:var(--muted)] dark:text-white/50">Номер карты</label>
            <input value={formattedCard} onChange={(e) => setCard(e.target.value)} inputMode="numeric" className="mt-2 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2 text-xl font-semibold tracking-[.15em] text-[color:var(--text)] outline-none dark:border-transparent dark:bg-transparent dark:px-0 dark:py-0 dark:text-white" />
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-[color:var(--muted)] dark:text-white/45">Владелец карты</label>
                <input value={holder} onChange={(e) => setHolder(e.target.value.toUpperCase())} className="mt-1 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2 text-sm font-semibold text-[color:var(--text)] outline-none dark:border-transparent dark:bg-transparent dark:px-0 dark:py-0 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-[color:var(--muted)] dark:text-white/45">Срок</label>
                  <input value={expiry} onChange={(e) => setExpiry(e.target.value.slice(0, 5))} className="mt-1 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2 text-sm font-semibold text-[color:var(--text)] outline-none dark:border-transparent dark:bg-transparent dark:px-0 dark:py-0 dark:text-white" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-[color:var(--muted)] dark:text-white/45">CVV</label>
                  <input value={cvc} onChange={(e) => setCvc(digits(e.target.value, 3))} inputMode="numeric" className="mt-1 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2 text-sm font-semibold text-[color:var(--text)] outline-none dark:border-transparent dark:bg-transparent dark:px-0 dark:py-0 dark:text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs text-cyan-700 dark:text-cyan-100/80">
            Тестовая карта уже заполнена. Позже сюда можно подключить YooKassa, CloudPayments или другой провайдер без изменения страниц покупки.
          </div>
          {error ? <div className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {onCancel ? <button type="button" onClick={onCancel} className="rounded-xl border border-[color:var(--stroke)] px-5 py-3 text-sm font-semibold text-[color:var(--muted)] hover:bg-[color:var(--bg)] dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5">Вернуться</button> : null}
            <button disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
              {busy ? "Проверяем…" : `Оплатить ${money(payment.amount)}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

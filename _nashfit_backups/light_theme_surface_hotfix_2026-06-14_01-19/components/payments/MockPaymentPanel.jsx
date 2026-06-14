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
      setError("Проверьте номер карты, срок действия и код безопасности.");
      return;
    }
    setBusy(true);
    try {
      const response = await apiPost(`/payments/${payment.id}/mock-confirm`, {
        cardholder: holder.trim() || "Владелец карты",
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
    <div className="rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-5 shadow-2xl md:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-4 w-4" /> Демо-оплата
          </div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-white/55">Данные карты не сохраняются. Это безопасная имитация платёжного шлюза.</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-white/45">К оплате</div>
          <div className="mt-1 text-2xl font-black text-emerald-300">{money(payment.amount)}</div>
        </div>
      </div>

      {done ? (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-8 text-center">
          <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-300" />
          <div className="text-xl font-bold text-white">Оплата прошла успешно</div>
          <div className="mt-2 text-sm text-white/60">Статус покупки уже обновлён.</div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/30 to-cyan-500/10 p-5 text-white">
            <CreditCard className="absolute right-5 top-5 h-7 w-7 text-white/45" />
            <label className="text-xs uppercase tracking-[.18em] text-white/50">Номер карты</label>
            <input value={formattedCard} onChange={(e) => setCard(e.target.value)} inputMode="numeric" className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xl font-semibold tracking-[.15em] text-white outline-none placeholder:text-white/30 focus:border-emerald-300" />
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/45">Владелец</label>
                <input value={holder} onChange={(e) => setHolder(e.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none placeholder:text-white/30 focus:border-emerald-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-white/45">Срок</label>
                  <input value={expiry} onChange={(e) => setExpiry(e.target.value.slice(0, 5))} className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none placeholder:text-white/30 focus:border-emerald-300" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-white/45">Код</label>
                  <input value={cvc} onChange={(e) => setCvc(digits(e.target.value, 3))} inputMode="numeric" className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none placeholder:text-white/30 focus:border-emerald-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-100/80">
            Тестовая карта уже заполнена. Позже сюда можно подключить YooKassa, CloudPayments или другой провайдер без изменения страниц покупки.
          </div>
          {error ? <div className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {onCancel ? <button type="button" onClick={onCancel} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 hover:bg-white/5">Вернуться</button> : null}
            <button disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
              {busy ? "Проверяем…" : `Оплатить ${money(payment.amount)}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

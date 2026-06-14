"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/services/api";
import MockPaymentPanel from "@/components/payments/MockPaymentPanel";
import { CalendarDays, CheckCircle2, Gift, CreditCard, ArrowRight, Clock3 } from "lucide-react";

const money = (v = 0) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(v || 0) / 100);
const date = (v) => v ? new Date(v).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "Без ограничения";

export default function AccountMembershipPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState(null);

  async function load() {
    setLoading(true);
    try { const r = await apiGet("/account/memberships"); setItems(r?.data || []); }
    catch (e) { setError(e?.message || "Не удалось загрузить абонементы."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const active = items.find((x) => x.status === "active" && !x.is_trial_grant) || items.find((x) => x.status === "active");

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><h1 className="text-3xl font-black text-[color:var(--text)]">Мой абонемент</h1><p className="mt-1 text-[color:var(--muted)]">Срок действия, пробное предложение и история покупок.</p></div>
        <Link href="/memberships" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">Выбрать тариф <ArrowRight className="h-4 w-4" /></Link>
      </div>

      {error ? <div className="rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-red-200">{error}</div> : null}
      {loading ? <div className="h-64 animate-pulse rounded-3xl bg-[color:var(--panel)]" /> : active ? (
        <section className="overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/50 p-7 md:p-9">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Активен</span>
              <h2 className="mt-4 text-3xl font-black text-white">{active.membership?.name}</h2>
              <p className="mt-2 max-w-2xl text-white/60">{active.membership?.description}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-right">
              <div className="text-xs uppercase tracking-wider text-white/45">Действует до</div>
              <div className="mt-1 text-xl font-bold text-white">{date(active.ends_at)}</div>
            </div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><CalendarDays className="h-5 w-5 text-emerald-300" /><div className="mt-3 text-xs text-white/45">Начало</div><div className="font-bold text-white">{date(active.starts_at)}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Clock3 className="h-5 w-5 text-cyan-300" /><div className="mt-3 text-xs text-white/45">Срок</div><div className="font-bold text-white">{active.membership?.duration_months || 1} мес.</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><CreditCard className="h-5 w-5 text-violet-300" /><div className="mt-3 text-xs text-white/45">Оплачено</div><div className="font-bold text-white">{money(active.total_amount)}</div></div>
          </div>
        </section>
      ) : <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-8 text-center"><Gift className="mx-auto h-10 w-10 text-emerald-400" /><h2 className="mt-4 text-xl font-bold text-[color:var(--text)]">Абонемент ещё не выбран</h2><p className="mt-2 text-[color:var(--muted)]">Посмотрите доступные тарифы и выберите удобный срок.</p></div>}

      <section>
        <h2 className="mb-4 text-xl font-bold text-[color:var(--text)]">История</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className={`rounded-xl p-3 ${item.is_trial_grant ? "bg-cyan-400/10 text-cyan-300" : "bg-emerald-400/10 text-emerald-300"}`}>{item.is_trial_grant ? <Gift className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}</div>
                <div><div className="font-bold text-[color:var(--text)]">{item.membership?.name}</div><div className="mt-1 text-sm text-[color:var(--muted)]">{date(item.starts_at)} — {date(item.ends_at)}</div>{item.promo_code ? <div className="mt-1 text-xs text-emerald-400">Промокод: {item.promo_code}</div> : null}</div>
              </div>
              <div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === "active" ? "bg-emerald-400/10 text-emerald-300" : "bg-yellow-400/10 text-yellow-200"}`}>{item.status === "active" ? "Активен" : "Ожидает оплаты"}</span>{item.payment?.status === "pending" ? <button onClick={() => setPayment(item.payment)} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950">Оплатить</button> : null}</div>
            </div>
          ))}
        </div>
      </section>

      {payment ? <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"><div className="mx-auto flex min-h-full max-w-2xl items-center py-8"><div className="w-full"><MockPaymentPanel payment={payment} title="Оплата абонемента" onCancel={() => setPayment(null)} onSuccess={async () => { setPayment(null); await load(); }} /></div></div></div> : null}
    </div>
  );
}

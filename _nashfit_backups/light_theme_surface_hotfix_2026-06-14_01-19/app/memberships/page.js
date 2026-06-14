"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import MockPaymentPanel from "@/components/payments/MockPaymentPanel";
import { Check, Sparkles, TicketPercent, CalendarRange, ShieldCheck, ArrowRight, Gift, X } from "lucide-react";

const money = (kopecks = 0) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(kopecks || 0) / 100);

export default function MembershipsPage() {
  const { isAuthed } = useAuth();
  const [plans, setPlans] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [owned, setOwned] = useState([]);
  const [promo, setPromo] = useState("START10");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [payment, setPayment] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [plansRes, promoRes, accountRes] = await Promise.all([
        apiGet("/memberships"), apiGet("/promotions"), isAuthed ? apiGet("/account/memberships") : Promise.resolve({ data: [] }),
      ]);
      setPlans(plansRes?.data || []);
      setPromotions(promoRes?.data || []);
      setOwned(accountRes?.data || []);
    } catch (e) {
      setError(e?.message || "Не удалось загрузить абонементы.");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [isAuthed]);

  const activePlanIds = useMemo(() => new Set(owned.filter((x) => ["active", "pending"].includes(x.status)).map((x) => x.membership?.id)), [owned]);

  async function purchase(plan) {
    if (!isAuthed) return;
    setBusyId(plan.id); setError("");
    try {
      const response = await apiPost(`/memberships/${plan.id}/purchase`, { promo_code: promo.trim() || null });
      const item = response?.data;
      setSelectedPurchase(item);
      if (item?.payment?.status === "pending") setPayment(item.payment);
      else await load();
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось создать покупку.");
    } finally { setBusyId(null); }
  }

  return (
    <main className="min-h-screen bg-[color:var(--bg)] py-12">
      <div className="container-fitlab">
        <section className="relative overflow-hidden rounded-[2rem] border border-[color:var(--accent-border)] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/60 px-6 py-12 md:px-12 md:py-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[color:var(--accent-soft)] blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)]"><Sparkles className="h-4 w-4" /> Абонементы НашФит</span>
            <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">Зал для результата, а не для обещаний</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 md:text-lg">Выберите срок, который подходит вашему темпу. Бесплатные программы и прогресс остаются доступны всем — абонемент открывает путь в офлайн-зал.</p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-white/70">
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">Без списания посещений</span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">Демо-оплата</span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">Промокоды и акции</span>
            </div>
          </div>
        </section>

        {promotions.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {promotions.slice(0, 2).map((item) => (
              <div key={item.id} className="rounded-2xl border border-[color:var(--secondary-border)] bg-[color:var(--secondary-soft)] p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-[color:var(--secondary)]"><TicketPercent className="h-5 w-5" /> {item.badge || "Акция"}</div>
                <div className="mt-2 text-xl font-bold text-[color:var(--text)]">{item.banner_title || item.name}</div>
                <p className="mt-1 text-sm text-[color:var(--muted)]">{item.banner_text || item.description}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-bold text-[color:var(--text)]">Есть промокод?</div>
            <p className="text-sm text-[color:var(--muted)]">Он будет применён к выбранному абонементу.</p>
          </div>
          <div className="flex w-full max-w-md gap-2">
            <input value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} placeholder="START10" className="min-w-0 flex-1 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 font-semibold uppercase text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]" />
            {promo ? <button onClick={() => setPromo("")} className="rounded-xl border border-[color:var(--stroke)] px-3 text-[color:var(--muted)]"><X className="h-5 w-5" /></button> : null}
          </div>
        </div>

        {error ? <div className="mt-5 rounded-xl border border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] bg-[color:var(--danger-soft)] px-4 py-3 text-[color:var(--danger)]">{error}</div> : null}

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-96 animate-pulse rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)]" />) : plans.map((plan) => {
            const ownedPlan = activePlanIds.has(plan.id);
            return (
              <article key={plan.id} className={`relative flex min-h-[420px] flex-col overflow-hidden rounded-3xl border p-6 ${plan.is_featured ? "border-[color:var(--accent-border)] bg-gradient-to-b from-emerald-400/15 to-[color:var(--panel)] shadow-xl shadow-emerald-950/20" : "border-[color:var(--stroke)] bg-[color:var(--panel)]"}`}>
                {plan.badge ? <span className="mb-5 w-fit rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-black uppercase tracking-wider text-[color:var(--on-accent)]">{plan.badge}</span> : null}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-[color:var(--text)]">{plan.name}</h2>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[color:var(--muted)]"><CalendarRange className="h-4 w-4" /> {plan.is_trial ? `${plan.trial_visits} посещения в течение 30 дней` : `${plan.duration_months} мес.`}</div>
                  </div>
                  {plan.is_trial ? <Gift className="h-8 w-8 text-[color:var(--accent)]" /> : <ShieldCheck className="h-8 w-8 text-[color:var(--accent)]" />}
                </div>
                <p className="mt-4 min-h-12 text-sm leading-6 text-[color:var(--muted)]">{plan.description}</p>
                <div className="mt-6">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-[color:var(--text)]">{plan.price ? money(plan.price) : "Бесплатно"}</span>
                    {plan.old_price ? <span className="pb-1 text-sm text-[color:var(--muted)] line-through">{money(plan.old_price)}</span> : null}
                  </div>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {(plan.features || []).map((feature) => <li key={feature} className="flex gap-3 text-sm text-[color:var(--text)]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--accent)]" /> {feature}</li>)}
                </ul>
                {plan.is_trial ? (
                  <div className="mt-6 rounded-xl border border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--accent)]">Выдаётся автоматически после регистрации</div>
                ) : isAuthed ? (
                  <button disabled={busyId === plan.id || ownedPlan} onClick={() => purchase(plan)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 font-bold text-[color:var(--on-accent)] hover:bg-[color:var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60">
                    {ownedPlan ? "Уже оформлен" : busyId === plan.id ? "Создаём счёт…" : <>Выбрать тариф <ArrowRight className="h-5 w-5" /></>}
                  </button>
                ) : <Link href="/login?next=/memberships" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 font-bold text-[color:var(--on-accent)]">Войти и выбрать <ArrowRight className="h-5 w-5" /></Link>}
              </article>
            );
          })}
        </section>
      </div>

      {payment ? (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="mx-auto flex min-h-full max-w-2xl items-center py-8">
            <div className="w-full">
              <MockPaymentPanel payment={payment} title={`Абонемент «${selectedPurchase?.membership?.name || "НашФит"}»`} onCancel={() => setPayment(null)} onSuccess={async () => { setPayment(null); await load(); }} />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

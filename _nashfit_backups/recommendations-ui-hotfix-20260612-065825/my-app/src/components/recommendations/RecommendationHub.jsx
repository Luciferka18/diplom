"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Dumbbell,
  Loader2,
  Package,
  Sparkles,
  Star,
  TicketCheck,
} from "lucide-react";
import { apiGet } from "@/services/api";

const rubles = (value = 0) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const kopecks = (value = 0) => rubles(Number(value || 0) / 100);

function ProductRecommendation({ item }) {
  return (
    <Link
      href={item.href || `/shop/${item.id}`}
      className="group overflow-hidden rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--bg)] transition hover:-translate-y-1 hover:border-emerald-400/45"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-900/60">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center"><Package className="h-10 w-10 text-emerald-400" /></div>
        )}
        {item.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-black text-emerald-300 backdrop-blur">
            {item.badge}
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-400">
          {item.headline || "Для ваших тренировок"}
        </p>
        <h3 className="mt-2 line-clamp-2 text-lg font-black text-[color:var(--text)]">{item.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">
          {item.description_override || item.subtitle || "Полезное дополнение к тренировочному плану."}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="font-black text-[color:var(--text)]">{rubles(item.price)}</div>
            {item.old_price ? <div className="text-xs text-[color:var(--muted)] line-through">{rubles(item.old_price)}</div> : null}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400">
            {item.cta_label || "Смотреть"} <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function TrainerRecommendation({ item }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/10 to-transparent p-5">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-cyan-400/15">
          {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Dumbbell className="h-7 w-7 text-cyan-300" /></div>}
        </div>
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-cyan-300">
            <BadgeCheck className="h-4 w-4" /> {item.headline || "Помощь специалиста"}
          </div>
          <h3 className="mt-2 text-xl font-black text-[color:var(--text)]">{item.name}</h3>
          <p className="mt-1 text-sm text-cyan-200/80">{item.subtitle || "Тренер НашФит"}</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">
        {item.description_override || item.description || "Тренер поможет адаптировать нагрузку, проверить технику и быстрее прийти к цели."}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={item.href || `/trainers/${item.id}`} className="rounded-xl border border-[color:var(--stroke)] px-4 py-2 text-sm font-bold hover:border-cyan-400/50">
          Профиль
        </Link>
        <Link href={item.booking_href || `/booking?trainer=${item.id}`} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-300">
          {item.cta_label || "Записаться"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function MembershipRecommendation({ item }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-500/15 via-violet-500/5 to-transparent p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-violet-300">
            <TicketCheck className="h-4 w-4" /> {item.headline || item.badge || "Тренируйтесь в зале"}
          </div>
          <h3 className="mt-3 text-2xl font-black text-[color:var(--text)]">{item.name}</h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            {item.description_override || item.subtitle}
          </p>
        </div>
        <Sparkles className="h-7 w-7 shrink-0 text-violet-300" />
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-black text-white">{kopecks(item.price)}</div>
          {item.old_price ? <div className="text-sm text-[color:var(--muted)] line-through">{kopecks(item.old_price)}</div> : null}
        </div>
        <Link href={item.href || "/memberships"} className="inline-flex items-center gap-2 rounded-xl bg-violet-400 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-violet-300">
          {item.cta_label || "Выбрать"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function RecommendationHub({ contextType, contextId, className = "" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const endpoint = useMemo(() => {
    if (contextType === "account") return "/account/recommendations";
    if (!contextType || !contextId) return null;
    return `/recommendations/${contextType}/${contextId}`;
  }, [contextType, contextId]);

  useEffect(() => {
    if (!endpoint) return;
    let alive = true;
    setLoading(true);
    setError("");
    apiGet(endpoint)
      .then((response) => alive && setData(response?.data ?? response))
      .catch((requestError) => alive && setError(requestError?.message || "Не удалось загрузить рекомендации."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [endpoint]);

  if (!endpoint) return null;
  if (loading) {
    return (
      <section className={`rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-7 ${className}`}>
        <div className="flex items-center gap-3 text-sm text-[color:var(--muted)]"><Loader2 className="h-5 w-5 animate-spin text-emerald-400" /> Подбираем полезные предложения…</div>
      </section>
    );
  }
  if (error || !data) return null;

  const products = Array.isArray(data.products) ? data.products : [];
  const trainers = Array.isArray(data.trainers) ? data.trainers : [];
  const memberships = Array.isArray(data.memberships) ? data.memberships : [];
  if (!products.length && !trainers.length && !memberships.length) return null;

  return (
    <section className={`overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-[color:var(--panel)] ${className}`}>
      <div className="border-b border-[color:var(--stroke)] bg-gradient-to-r from-emerald-500/12 via-cyan-500/7 to-transparent p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
              <Sparkles className="h-4 w-4" /> Персональная подборка
            </div>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">{data.title || "Рекомендации НашФит"}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">{data.subtitle}</p>
          </div>
          {data.reason ? <div className="max-w-sm rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3 text-xs leading-5 text-emerald-200/80">{data.reason}</div> : null}
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        {products.length ? (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="inline-flex items-center gap-2 text-lg font-black"><Package className="h-5 w-5 text-emerald-400" /> Полезный инвентарь</h3>
              <Link href="/shop" className="text-sm font-bold text-emerald-400 hover:text-emerald-300">Весь магазин →</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{products.map((item) => <ProductRecommendation key={`product-${item.id}`} item={item} />)}</div>
          </div>
        ) : null}

        {(trainers.length || memberships.length) ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-4">{trainers.map((item) => <TrainerRecommendation key={`trainer-${item.id}`} item={item} />)}</div>
            <div className="grid gap-4">{memberships.map((item) => <MembershipRecommendation key={`membership-${item.id}`} item={item} />)}</div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

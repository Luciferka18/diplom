"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Dumbbell,
  Loader2,
  Package,
  Star,
  Target,
  TicketCheck,
} from "lucide-react";
import { apiGet } from "@/services/api";

const rubles = (value = 0) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));
const kopecks = (value = 0) => rubles(Number(value || 0) / 100);

const CONTEXT_COPY = {
  article: { eyebrow: "Практика по теме", fallbackTitle: "Что поможет применить материал", productsTitle: "Подходящий инвентарь", actionsTitle: "Поддержка в клубе" },
  program: { eyebrow: "Дополнить программу", fallbackTitle: "Всё для уверенного результата", productsTitle: "Инвентарь для занятий", actionsTitle: "Тренер и доступ в зал" },
  account: { eyebrow: "Ваш следующий шаг", fallbackTitle: "Подборка по вашим целям", productsTitle: "Полезно для тренировок", actionsTitle: "Продолжить с НашФит" },
};

function ProductRecommendation({ item }) {
  const category = item.category_name || item.category || "Инвентарь";
  return (
    <Link href={item.href || `/shop/${item.id}`} className="group grid min-h-[154px] grid-cols-[104px_minmax(0,1fr)] overflow-hidden rounded-[20px] border border-[color:var(--stroke)] bg-[color:var(--panel-2)] transition hover:border-[color:var(--stroke-strong)] hover:bg-[color:var(--elevated)]">
      <div className="relative overflow-hidden bg-[color:var(--bg2)]">
        {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="grid h-full place-items-center text-[color:var(--accent)]"><Package className="h-7 w-7" /></div>}
      </div>
      <div className="flex min-w-0 flex-col p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[color:var(--warm)]">{item.headline || category}</p>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-black leading-snug text-[color:var(--text)]">{item.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[color:var(--muted)]">{item.description_override || item.subtitle || "Подходит к выбранной цели и формату тренировок."}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <div className="text-sm font-black text-[color:var(--text)]">{rubles(item.price)}</div>
            {Number(item.rating || 0) > 0 ? <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[color:var(--muted)]"><Star className="h-3 w-3 fill-[color:var(--warning)] text-[color:var(--warning)]" /> {item.rating}</div> : null}
          </div>
          <ArrowUpRight className="h-4 w-4 text-[color:var(--accent)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function TrainerRecommendation({ item }) {
  const initial = String(item.name || "Т").trim().charAt(0).toUpperCase();
  return (
    <article className="flex h-full flex-col rounded-[22px] border border-[color:var(--secondary-border)] bg-[color:var(--secondary-soft)] p-5">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[16px] bg-[color:var(--panel)]">
          {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-lg font-black text-[color:var(--secondary)]">{initial}</div>}
        </div>
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[color:var(--secondary)]"><BadgeCheck className="h-3.5 w-3.5" /> Тренер по теме</div>
          <h3 className="mt-1.5 truncate text-lg font-black text-[color:var(--text)]">{item.name}</h3>
          <p className="truncate text-xs text-[color:var(--muted)]">{item.subtitle || "Тренер НашФит"}</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">{item.description_override || item.description || "Поможет проверить технику и адаптировать нагрузку под вашу цель."}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Link href={item.href || `/trainers/${item.id}`} className="rounded-full border border-[color:var(--secondary-border)] bg-[color:var(--panel)] px-4 py-2 text-sm font-bold text-[color:var(--text)]">Профиль</Link>
        <Link href={item.booking_href || `/booking?trainer=${item.id}`} className="rounded-full bg-[color:var(--secondary)] px-4 py-2 text-sm font-black text-white">Записаться</Link>
      </div>
    </article>
  );
}

function MembershipRecommendation({ item }) {
  const features = Array.isArray(item.features) ? item.features.slice(0, 2) : [];
  return (
    <article className="flex h-full flex-col rounded-[22px] border border-[color:var(--warm-border)] bg-[color:var(--warm-soft)] p-5">
      <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[color:var(--warm)]"><TicketCheck className="h-4 w-4" /> Абонемент</div>
      <h3 className="mt-3 text-xl font-black text-[color:var(--text)]">{item.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">{item.description_override || item.subtitle || "Регулярные тренировки в клубе НашФит."}</p>
      {features.length ? <ul className="mt-4 space-y-2 text-xs text-[color:var(--text-soft)]">{features.map((feature) => <li key={feature} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[color:var(--warm)]" /> {feature}</li>)}</ul> : null}
      <div className="mt-auto flex items-end justify-between gap-4 pt-5">
        <div className="text-xl font-black text-[color:var(--text)]">{kopecks(item.price)}</div>
        <Link href={item.href || "/memberships"} className="rounded-full bg-[color:var(--warm)] px-4 py-2 text-sm font-black text-white">Выбрать</Link>
      </div>
    </article>
  );
}

export default function RecommendationHub({ contextType, contextId, className = "" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const endpoint = useMemo(() => contextType === "account" ? "/account/recommendations" : contextType && contextId ? `/recommendations/${contextType}/${contextId}` : null, [contextType, contextId]);

  useEffect(() => {
    if (!endpoint) return;
    let alive = true;
    setLoading(true);
    apiGet(endpoint)
      .then((response) => alive && setData(response?.data ?? response))
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [endpoint]);

  if (!endpoint) return null;
  if (loading) return <section className={`rounded-[24px] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 ${className}`}><div className="flex items-center gap-3 text-sm text-[color:var(--muted)]"><Loader2 className="h-5 w-5 animate-spin text-[color:var(--accent)]" /> Подбираем рекомендации…</div></section>;
  if (!data) return null;

  const copy = CONTEXT_COPY[contextType] || CONTEXT_COPY.article;
  const products = Array.isArray(data.products) ? data.products.slice(0, contextType === "article" ? 2 : 3) : [];
  const trainer = Array.isArray(data.trainers) ? data.trainers[0] : null;
  const membership = Array.isArray(data.memberships) ? data.memberships[0] : null;
  if (!products.length && !trainer && !membership) return null;

  return (
    <section className={`overflow-hidden rounded-[28px] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-[var(--shadow-sm)] ${className}`}>
      <div className="grid gap-5 border-b border-[color:var(--stroke)] px-5 py-6 sm:px-7 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="nf-eyebrow inline-flex items-center gap-2"><Target className="h-4 w-4" /> {copy.eyebrow}</div>
          <h2 className="mt-2 max-w-2xl text-2xl font-black tracking-[-0.04em] sm:text-3xl">{data.title || copy.fallbackTitle}</h2>
          {data.subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">{data.subtitle}</p> : null}
        </div>
        {data.reason ? <p className="max-w-sm border-l-2 border-[color:var(--warm)] pl-4 text-xs leading-5 text-[color:var(--muted)]">{data.reason}</p> : null}
      </div>

      <div className="grid gap-7 p-5 sm:p-7 xl:grid-cols-[1.3fr_.7fr]">
        {products.length ? <div><div className="mb-4 flex items-center justify-between gap-3"><h3 className="inline-flex items-center gap-2 text-base font-black"><Package className="h-5 w-5 text-[color:var(--accent)]" /> {copy.productsTitle}</h3><Link href="/shop" className="text-xs font-black text-[color:var(--accent)]">В магазин</Link></div><div className="grid gap-3 md:grid-cols-2">{products.map((item) => <ProductRecommendation key={item.id} item={item} />)}</div></div> : null}
        {(trainer || membership) ? <div><h3 className="mb-4 inline-flex items-center gap-2 text-base font-black"><Dumbbell className="h-5 w-5 text-[color:var(--secondary)]" /> {copy.actionsTitle}</h3><div className="grid gap-3">{trainer ? <TrainerRecommendation item={trainer} /> : null}{membership ? <MembershipRecommendation item={membership} /> : null}</div></div> : null}
      </div>
    </section>
  );
}

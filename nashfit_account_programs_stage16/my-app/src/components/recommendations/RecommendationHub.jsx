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
  Target,
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

const CONTEXT_COPY = {
  article: {
    eyebrow: "По теме материала",
    fallbackTitle: "Продолжите путь с НашФит",
    productsTitle: "Что пригодится на практике",
    actionsTitle: "Поддержка и занятия в зале",
  },
  program: {
    eyebrow: "Усилить программу",
    fallbackTitle: "Всё необходимое для результата",
    productsTitle: "Инвентарь для программы",
    actionsTitle: "Помощь тренера и доступ в зал",
  },
  account: {
    eyebrow: "Для вашего следующего шага",
    fallbackTitle: "Персональные рекомендации",
    productsTitle: "Полезно для ваших тренировок",
    actionsTitle: "Продолжить с НашФит",
  },
};

function ProductRecommendation({ item }) {
  const category = item.category_name || item.category || "Товар";

  return (
    <Link
      href={item.href || `/shop/${item.id}`}
      className="group overflow-hidden rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/10"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-emerald-500/8">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-emerald-500/16 via-cyan-500/10 to-transparent">
            <Package className="h-10 w-10 text-emerald-700 dark:text-emerald-300" />
          </div>
        )}
        {item.badge ? (
          <span className="absolute left-3 top-3 rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)]/90 px-2.5 py-1 text-[10px] font-black text-emerald-700 backdrop-blur dark:text-emerald-300">
            {item.badge}
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
          {item.headline || category}
        </p>
        <h3 className="mt-2 line-clamp-2 text-base font-black leading-tight text-[color:var(--text)]">
          {item.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[color:var(--muted)]">
          {item.description_override || item.subtitle || "Полезное дополнение к вашим тренировкам."}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="font-black text-[color:var(--text)]">{rubles(item.price)}</div>
            {Number(item.rating || 0) > 0 ? (
              <div className="mt-1 flex items-center gap-1 text-xs text-[color:var(--muted)]">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-[color:var(--text)]">{item.rating}</span>
              </div>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
            Смотреть <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function TrainerRecommendation({ item }) {
  const initial = String(item.name || "Т").trim().charAt(0).toUpperCase();

  return (
    <article className="flex h-full flex-col rounded-[1.8rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-5">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-cyan-300/20 bg-cyan-400/10">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xl font-black text-cyan-700 dark:text-cyan-300">
              {initial}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
            <BadgeCheck className="h-4 w-4" /> {item.headline || "Рекомендуемый тренер"}
          </div>
          <h3 className="mt-2 truncate text-xl font-black text-[color:var(--text)]">{item.name}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-[color:var(--muted)]">
            {item.subtitle || "Тренер НашФит"}
          </p>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">
        {item.description_override ||
          item.description ||
          "Поможет проверить технику, адаптировать нагрузку и быстрее прийти к цели."}
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Link
          href={item.href || `/trainers/${item.id}`}
          className="rounded-xl border border-[color:var(--stroke)] px-4 py-2 text-sm font-bold transition hover:border-cyan-400/50"
        >
          Профиль
        </Link>
        <Link
          href={item.booking_href || `/booking?trainer=${item.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-black text-white transition hover:bg-cyan-500"
        >
          {item.cta_label || "Записаться"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function MembershipRecommendation({ item }) {
  const features = Array.isArray(item.features) ? item.features.slice(0, 2) : [];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
            <TicketCheck className="h-4 w-4" /> {item.headline || item.badge || "Абонемент в зал"}
          </div>
          <h3 className="mt-3 text-2xl font-black text-[color:var(--text)]">{item.name}</h3>
        </div>
        <Sparkles className="h-7 w-7 shrink-0 text-violet-700 dark:text-violet-300" />
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">
        {item.description_override || item.subtitle || "Регулярные тренировки в зале НашФит."}
      </p>

      {features.length ? (
        <ul className="mt-4 space-y-2 text-xs text-[color:var(--muted)]">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> {feature}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto flex items-end justify-between gap-4 pt-5">
        <div>
          <div className="text-2xl font-black text-[color:var(--text)]">{kopecks(item.price)}</div>
          {item.old_price ? (
            <div className="text-sm text-[color:var(--muted)] line-through">{kopecks(item.old_price)}</div>
          ) : null}
        </div>
        <Link
          href={item.href || "/memberships"}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-violet-500"
        >
          {item.cta_label || "Выбрать"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
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
      .catch((requestError) => {
        if (alive) setError(requestError?.message || "Не удалось загрузить рекомендации.");
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [endpoint]);

  if (!endpoint) return null;

  if (loading) {
    return (
      <section className={`rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 ${className}`}>
        <div className="flex items-center gap-3 text-sm text-[color:var(--muted)]">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700 dark:text-emerald-300" />
          Подбираем полезные предложения…
        </div>
      </section>
    );
  }

  if (error || !data) return null;

  const copy = CONTEXT_COPY[contextType] || CONTEXT_COPY.article;
  const productLimit = contextType === "article" ? 2 : 3;
  const products = Array.isArray(data.products) ? data.products.slice(0, productLimit) : [];
  const trainers = Array.isArray(data.trainers) ? data.trainers.slice(0, 1) : [];
  const memberships = Array.isArray(data.memberships) ? data.memberships.slice(0, 1) : [];
  const actions = [...trainers.map((item) => ({ ...item, recommendationType: "trainer" })), ...memberships.map((item) => ({ ...item, recommendationType: "membership" }))];

  if (!products.length && !actions.length) return null;

  return (
    <section className={`overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] ${className}`}>
      <div className="border-b border-[color:var(--stroke)] bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent px-5 py-6 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              <Target className="h-4 w-4" /> {copy.eyebrow}
            </div>
            <h2 className="mt-2 text-2xl font-black leading-tight text-[color:var(--text)] sm:text-3xl">
              {data.title || copy.fallbackTitle}
            </h2>
            {data.subtitle ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
                {data.subtitle}
              </p>
            ) : null}
          </div>

          {data.reason ? (
            <div className="max-w-md rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-xs leading-5 text-[color:var(--muted)]">
              <span className="font-black text-emerald-700 dark:text-emerald-300">Почему это вам:</span> {data.reason}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-7 p-5 sm:p-7">
        {products.length ? (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="inline-flex items-center gap-2 text-lg font-black text-[color:var(--text)]">
                <Package className="h-5 w-5 text-emerald-700 dark:text-emerald-300" /> {copy.productsTitle}
              </h3>
              <Link href="/shop" className="text-sm font-bold text-emerald-700 dark:text-emerald-300 transition hover:text-emerald-300">
                Перейти в магазин →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((item) => (
                <ProductRecommendation key={`product-${item.id}`} item={item} />
              ))}
            </div>
          </div>
        ) : null}

        {actions.length ? (
          <div>
            <h3 className="mb-4 inline-flex items-center gap-2 text-lg font-black text-[color:var(--text)]">
              <Dumbbell className="h-5 w-5 text-cyan-700 dark:text-cyan-300" /> {copy.actionsTitle}
            </h3>
            <div className="grid gap-4 lg:grid-cols-2">
              {actions.map((item) =>
                item.recommendationType === "trainer" ? (
                  <TrainerRecommendation key={`trainer-${item.id}`} item={item} />
                ) : (
                  <MembershipRecommendation key={`membership-${item.id}`} item={item} />
                )
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

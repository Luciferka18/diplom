"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Dumbbell,
  PackageSearch,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { apiGet } from "@/services/api";

const SUGGESTIONS = ["похудение", "набор массы", "резинки", "силовая", "питание", "растяжка"];

function listFrom(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function includesAny(item, query, fields) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) => String(item?.[field] || "").toLowerCase().includes(q));
}

function resultCount(groups) {
  return groups.reduce((sum, group) => sum + group.items.length, 0);
}

function price(value) {
  const number = Number(value || 0);
  if (!number) return null;
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(number);
}

function ResultCard({ item, type }) {
  const config = {
    product: {
      href: `/shop/${item.id}`,
      icon: ShoppingBag,
      label: "Товар",
      title: item.name,
      text: item.short_description || item.description || item.brand || "Товар из магазина НашФит",
      meta: price(item.price) || item.brand || "Магазин",
      image: item.image_url || item.gallery?.[0],
      accent: "emerald",
    },
    program: {
      href: `/programs/${item.id}`,
      icon: Dumbbell,
      label: "Программа",
      title: item.title || item.name,
      text: item.description || "Бесплатная программа тренировок",
      meta: `${item.duration_weeks || 1} нед. · ${item.workouts_count || 0} тренировок`,
      image: item.image_url || item.cover_image_url,
      accent: "cyan",
    },
    article: {
      href: `/articles/${item.id}`,
      icon: BookOpen,
      label: "Статья",
      title: item.title,
      text: item.excerpt || item.description || "Материал фитнес-журнала",
      meta: item.reading_time_minutes ? `${item.reading_time_minutes} мин чтения` : "Журнал",
      image: item.cover_image_url || item.image_url,
      accent: "violet",
    },
    trainer: {
      href: `/trainers/${item.id}`,
      icon: UserRound,
      label: "Тренер",
      title: item.name,
      text: item.specialization || item.bio || "Персональный тренер НашФит",
      meta: item.avg_rating ? `★ ${item.avg_rating}` : `${item.experience_years || 0} лет опыта`,
      image: item.photo_url || item.avatar_url,
      accent: "amber",
    },
  }[type];

  const Icon = config.icon;
  const accentClass = {
    emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    cyan: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
    violet: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
    amber: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  }[config.accent];

  return (
    <Link
      href={config.href}
      className="group grid gap-4 rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 transition hover:-translate-y-0.5 hover:border-emerald-500/35 hover:shadow-xl hover:shadow-emerald-950/10 sm:grid-cols-[104px_1fr]"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] sm:h-[104px] sm:w-[104px]">
        {config.image ? (
          <img src={config.image} alt={config.title || config.label} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-transparent">
            <Icon className="h-9 w-9 text-emerald-600 dark:text-emerald-300" />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${accentClass}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
          {config.meta ? <span className="text-xs font-semibold text-[color:var(--muted)]">{config.meta}</span> : null}
        </div>

        <h3 className="mt-2 line-clamp-2 text-lg font-black text-[color:var(--text)] transition group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
          {config.title || "Без названия"}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{config.text}</p>

        <div className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
          Открыть
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function Group({ title, icon: Icon, items, type, href }) {
  if (!items.length) return null;

  return (
    <section className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[color:var(--text)]">{title}</h2>
            <p className="text-sm text-[color:var(--muted)]">Найдено: {items.length}</p>
          </div>
        </div>
        <Link href={href} className="hidden rounded-xl border border-[color:var(--stroke)] px-4 py-2 text-sm font-bold text-[color:var(--text)] transition hover:bg-[color:var(--bg)] sm:inline-flex">
          Все
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => <ResultCard key={`${type}-${item.id}`} item={item} type={type} />)}
      </div>
    </section>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ products: [], programs: [], articles: [], trainers: [] });

  const cleanQuery = query.trim();

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("per_page", "6");
        if (cleanQuery) params.set("q", cleanQuery);

        const [productsRes, programsRes, articlesRes, trainersRes] = await Promise.allSettled([
          apiGet(`/products?${params.toString()}`),
          apiGet(`/programs?${params.toString()}`),
          apiGet(`/articles?${params.toString()}`),
          apiGet("/trainers"),
        ]);

        if (cancelled) return;

        const trainers = listFrom(trainersRes.value)
          .filter((trainer) => includesAny(trainer, cleanQuery, ["name", "specialization", "bio"]))
          .slice(0, 6);

        setData({
          products: productsRes.status === "fulfilled" ? listFrom(productsRes.value).slice(0, 6) : [],
          programs: programsRes.status === "fulfilled" ? listFrom(programsRes.value).slice(0, 6) : [],
          articles: articlesRes.status === "fulfilled" ? listFrom(articlesRes.value).slice(0, 6) : [],
          trainers: trainersRes.status === "fulfilled" ? trainers : [],
        });

        const failed = [productsRes, programsRes, articlesRes, trainersRes].filter((item) => item.status === "rejected");
        if (failed.length === 4) setError("Не удалось загрузить поиск. Проверь backend Laravel.");
      } catch (e) {
        if (!cancelled) setError(e?.message || "Не удалось выполнить поиск.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cleanQuery]);

  const groups = useMemo(() => [
    { title: "Товары", icon: ShoppingBag, items: data.products, type: "product", href: cleanQuery ? `/shop?q=${encodeURIComponent(cleanQuery)}` : "/shop" },
    { title: "Программы", icon: Dumbbell, items: data.programs, type: "program", href: cleanQuery ? `/programs?q=${encodeURIComponent(cleanQuery)}` : "/programs" },
    { title: "Статьи", icon: BookOpen, items: data.articles, type: "article", href: cleanQuery ? `/articles?q=${encodeURIComponent(cleanQuery)}` : "/articles" },
    { title: "Тренеры", icon: UserRound, items: data.trainers, type: "trainer", href: "/trainers" },
  ], [data, cleanQuery]);

  const count = resultCount(groups);

  return (
    <main className="min-h-screen bg-[color:var(--bg)] pb-20">
      <section className="container-fitlab pt-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/12 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Поиск по сайту
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight text-[color:var(--text)] md:text-6xl">
              Найди тренировку, тренера, статью или товар
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] md:text-lg">
              Единый поиск помогает быстрее перейти к нужному разделу: программы, магазин, журнал и тренеры собраны в одном месте.
            </p>

            <div className="mt-7 rounded-[1.4rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-2 shadow-sm">
              <label className="flex items-center gap-3">
                <Search className="ml-3 h-5 w-5 text-[color:var(--muted)]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Например: набор массы, питание, резинки, тренер..."
                  className="min-h-12 flex-1 bg-transparent text-base font-semibold text-[color:var(--text)] outline-none placeholder:text-[color:var(--muted2)]"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="mr-2 grid h-10 w-10 place-items-center rounded-xl text-[color:var(--muted)] transition hover:bg-[color:var(--panel)] hover:text-[color:var(--text)]"
                    aria-label="Очистить поиск"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : null}
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuery(item)}
                  className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-1.5 text-sm font-semibold text-[color:var(--muted)] transition hover:border-emerald-500/30 hover:text-[color:var(--text)]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-fitlab mt-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5">
            <PackageSearch className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
            <div className="mt-3 text-2xl font-black text-[color:var(--text)]">{loading ? "..." : count}</div>
            <div className="text-sm text-[color:var(--muted)]">результатов сейчас</div>
          </div>
          <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5">
            <CalendarDays className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
            <div className="mt-3 text-2xl font-black text-[color:var(--text)]">4</div>
            <div className="text-sm text-[color:var(--muted)]">раздела сайта</div>
          </div>
          <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5">
            <Star className="h-6 w-6 text-amber-600 dark:text-amber-300" />
            <div className="mt-3 text-2xl font-black text-[color:var(--text)]">быстро</div>
            <div className="text-sm text-[color:var(--muted)]">без перезагрузки страницы</div>
          </div>
        </div>
      </section>

      <section className="container-fitlab mt-8 space-y-6">
        {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-700 dark:text-red-200">{error}</div> : null}

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--panel)]" />
            ))}
          </div>
        ) : count ? (
          groups.map((group) => <Group key={group.type} {...group} />)
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[color:var(--stroke)] bg-[color:var(--panel)] p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
              <Search className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-[color:var(--text)]">Ничего не найдено</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[color:var(--muted)]">
              Попробуй другое слово или перейди в каталог, программы, статьи или тренеров через меню.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Dumbbell,
  Layers3,
  Lightbulb,
  PackageSearch,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { apiGet } from "@/services/api";

const DEFAULT_QUERIES = [
  "йога",
  "йога для начинающих",
  "похудение",
  "набор массы",
  "питание",
  "растяжка",
  "силовая",
  "резинки",
  "протеин",
  "тренер",
  "спина",
  "кардио",
];

const EXTRA_AUTOCOMPLETE = [
  "йога",
  "йоги",
  "йогу",
  "йогой",
  "йога дома",
  "йога для начинающих",
  "растяжка",
  "растяжку",
  "растяжки",
  "питание",
  "питания",
  "похудение",
  "похудения",
  "набор массы",
  "мышцы",
  "мышц",
  "силовая тренировка",
  "силовые тренировки",
  "резинки",
  "резинка",
  "гантели",
  "кардио",
  "спина",
  "ноги",
  "пресс",
  "тренер",
  "тренера",
  "абонемент",
];

const RECENT_KEY = "nashfit_recent_searches";

const RUSSIAN_ENDINGS = [
  "иями",
  "ями",
  "ами",
  "ого",
  "ему",
  "ому",
  "ыми",
  "ими",
  "иях",
  "ах",
  "ях",
  "ую",
  "юю",
  "ая",
  "яя",
  "ое",
  "ее",
  "ые",
  "ие",
  "ый",
  "ий",
  "ой",
  "ей",
  "ов",
  "ев",
  "ам",
  "ям",
  "ом",
  "ем",
  "ою",
  "ею",
  "а",
  "я",
  "у",
  "ю",
  "ы",
  "и",
  "е",
  "о",
];

const SEARCH_FIELDS = {
  products: ["name", "title", "brand", "description", "short_description", "category", "slug"],
  programs: ["title", "name", "goal", "level", "description", "short_description", "slug"],
  articles: ["title", "excerpt", "description", "content", "category", "slug"],
  trainers: ["name", "specialization", "bio", "location", "club", "slug"],
};

function listFrom(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function toText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(toText).join(" ");
  if (typeof value === "object") return Object.values(value).map(toText).join(" ");
  return String(value);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokensFrom(value) {
  return normalizeText(value).split(" ").filter(Boolean);
}

function normalizeWord(word) {
  const clean = normalizeText(word).replace(/\s+/g, "");
  if (clean.length <= 3) return clean;

  for (const ending of RUSSIAN_ENDINGS) {
    if (clean.endsWith(ending) && clean.length - ending.length >= 3) {
      return clean.slice(0, -ending.length);
    }
  }

  return clean;
}

function levenshtein(a, b) {
  if (!a || !b) return Math.max(a.length, b.length);
  if (Math.abs(a.length - b.length) > 2) return 99;

  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[a.length][b.length];
}

function searchableText(item, fields) {
  return fields.map((field) => toText(item?.[field])).join(" ");
}

function scoreItem(item, query, fields) {
  const cleanQuery = normalizeText(query);
  if (!cleanQuery) return 1;

  const queryTokens = tokensFrom(cleanQuery);
  if (!queryTokens.length) return 1;

  const haystack = searchableText(item, fields);
  const normalizedHaystack = normalizeText(haystack);
  const candidateTokens = tokensFrom(haystack);
  const candidateStems = candidateTokens.map(normalizeWord);

  let score = 0;

  for (const queryToken of queryTokens) {
    const queryStem = normalizeWord(queryToken);
    let tokenScore = 0;

    if (normalizedHaystack.includes(queryToken)) tokenScore = Math.max(tokenScore, 70);

    for (let i = 0; i < candidateTokens.length; i += 1) {
      const token = candidateTokens[i];
      const stem = candidateStems[i];

      if (token === queryToken) tokenScore = Math.max(tokenScore, 100);
      else if (token.startsWith(queryToken) && queryToken.length >= 2) tokenScore = Math.max(tokenScore, 80);
      else if (stem === queryStem && queryStem.length >= 3) tokenScore = Math.max(tokenScore, 85);
      else if ((stem.startsWith(queryStem) || queryStem.startsWith(stem)) && queryStem.length >= 3 && stem.length >= 3) tokenScore = Math.max(tokenScore, 60);
      else if (token.includes(queryToken) && queryToken.length >= 3) tokenScore = Math.max(tokenScore, 45);
      else if (queryToken.length >= 4 && levenshtein(queryToken, token) <= 1) tokenScore = Math.max(tokenScore, 30);
      else if (queryStem.length >= 4 && levenshtein(queryStem, stem) <= 1) tokenScore = Math.max(tokenScore, 25);
    }

    if (!tokenScore) return 0;
    score += tokenScore;
  }

  const title = normalizeText(item?.title || item?.name || "");
  if (title.includes(cleanQuery)) score += 80;
  if (title.startsWith(cleanQuery)) score += 120;

  return score;
}

function dedupeById(items) {
  const map = new Map();
  for (const item of items) {
    const key = item?.id ? String(item.id) : JSON.stringify(item);
    if (!map.has(key)) map.set(key, item);
  }
  return Array.from(map.values());
}

function filterRank(items, query, fields, limit = 8) {
  const cleanQuery = normalizeText(query);
  if (!cleanQuery) return dedupeById(items).slice(0, limit);

  return dedupeById(items)
    .map((item) => ({ item, score: scoreItem(item, cleanQuery, fields) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

function resultCount(groups) {
  return groups.reduce((sum, group) => sum + group.items.length, 0);
}

function price(value) {
  const number = Number(value || 0);
  if (!number) return null;
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(number);
}

function saveRecentSearch(term, current = []) {
  const clean = normalizeText(term);
  if (clean.length < 2) return current;

  const next = [term.trim(), ...current.filter((item) => normalizeText(item) !== clean)].slice(0, 8);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch (error) {
    // localStorage can be unavailable in private mode; search still works.
  }
  return next;
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

function SearchInsights({ loading, count, groups, bestResult, cleanQuery }) {
  const activeGroups = groups.filter((group) => group.items.length);
  const topGroup = activeGroups
    .map((group) => ({ title: group.title, count: group.items.length }))
    .sort((a, b) => b.count - a.count)[0] || null;

  return (
    <section className="container-fitlab mt-6">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr_1.25fr]">
        <div className="rounded-[1.8rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[color:var(--muted)]">Найдено результатов</div>
              <div className="mt-2 text-3xl font-black text-[color:var(--text)]">{loading ? '...' : count}</div>
              <div className="mt-1 text-sm text-[color:var(--muted)]">
                {cleanQuery ? `По запросу «${cleanQuery}»` : 'Начни вводить, и поиск покажет подходящие материалы'}
              </div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
              <PackageSearch className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[color:var(--muted)]">Самый активный раздел</div>
              <div className="mt-2 text-2xl font-black text-[color:var(--text)]">{topGroup?.title || (loading ? '...' : '—')}</div>
              <div className="mt-1 text-sm text-[color:var(--muted)]">
                {topGroup ? `${topGroup.count} результатов в этом разделе` : 'Появится после первого совпадения'}
              </div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-500/12 text-cyan-700 dark:text-cyan-300">
              <Layers3 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-bold text-[color:var(--muted)]">Лучшее совпадение</div>
              <div className="mt-2 line-clamp-1 text-2xl font-black text-[color:var(--text)]">
                {bestResult?.title || (loading ? 'Ищем совпадение...' : 'Подходящих вариантов пока нет')}
              </div>
              <div className="mt-1 line-clamp-2 text-sm text-[color:var(--muted)]">
                {bestResult?.label ? `Раздел: ${bestResult.label}` : 'Попробуй более точный запрос или выбери подсказку ниже'}
              </div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/12 text-amber-700 dark:text-amber-300">
              <Lightbulb className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [data, setData] = useState({ products: [], programs: [], articles: [], trainers: [] });

  const cleanQuery = query.trim();

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(saved)) setRecentSearches(saved.filter(Boolean).slice(0, 8));
    } catch (error) {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const baseParams = new URLSearchParams({ per_page: "24" });
        const queryParams = new URLSearchParams({ per_page: "24" });
        if (cleanQuery) queryParams.set("q", cleanQuery);

        const [
          productsSearch,
          productsBase,
          programsSearch,
          programsBase,
          articlesSearch,
          articlesBase,
          trainersRes,
        ] = await Promise.allSettled([
          apiGet(`/products?${queryParams.toString()}`),
          apiGet(`/products?${baseParams.toString()}`),
          apiGet(`/programs?${queryParams.toString()}`),
          apiGet(`/programs?${baseParams.toString()}`),
          apiGet(`/articles?${queryParams.toString()}`),
          apiGet(`/articles?${baseParams.toString()}`),
          apiGet("/trainers"),
        ]);

        if (cancelled) return;

        const products = dedupeById([
          ...(productsSearch.status === "fulfilled" ? listFrom(productsSearch.value) : []),
          ...(productsBase.status === "fulfilled" ? listFrom(productsBase.value) : []),
        ]);
        const programs = dedupeById([
          ...(programsSearch.status === "fulfilled" ? listFrom(programsSearch.value) : []),
          ...(programsBase.status === "fulfilled" ? listFrom(programsBase.value) : []),
        ]);
        const articles = dedupeById([
          ...(articlesSearch.status === "fulfilled" ? listFrom(articlesSearch.value) : []),
          ...(articlesBase.status === "fulfilled" ? listFrom(articlesBase.value) : []),
        ]);
        const trainers = trainersRes.status === "fulfilled" ? listFrom(trainersRes.value) : [];

        setData({
          products: filterRank(products, cleanQuery, SEARCH_FIELDS.products, 8),
          programs: filterRank(programs, cleanQuery, SEARCH_FIELDS.programs, 8),
          articles: filterRank(articles, cleanQuery, SEARCH_FIELDS.articles, 8),
          trainers: filterRank(trainers, cleanQuery, SEARCH_FIELDS.trainers, 8),
        });

        const failed = [productsSearch, productsBase, programsSearch, programsBase, articlesSearch, articlesBase, trainersRes].filter((item) => item.status === "rejected");
        if (failed.length === 7) setError("Не удалось загрузить поиск. Проверь backend Laravel.");
      } catch (e) {
        if (!cancelled) setError(e?.message || "Не удалось выполнить поиск.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 260);

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

  const autocompleteTerms = useMemo(() => {
    const terms = new Set([...EXTRA_AUTOCOMPLETE, ...DEFAULT_QUERIES]);
    const addTerm = (value) => {
      const clean = normalizeText(value);
      if (clean.length >= 2 && clean.length <= 42) terms.add(clean);
    };

    data.products.forEach((item) => {
      addTerm(item.name);
      addTerm(item.brand);
      addTerm(item.category?.name || item.category);
    });
    data.programs.forEach((item) => {
      addTerm(item.title || item.name);
      addTerm(item.goal);
      addTerm(item.level);
    });
    data.articles.forEach((item) => {
      addTerm(item.title);
      addTerm(item.category?.name || item.category);
    });
    data.trainers.forEach((item) => {
      addTerm(item.name);
      addTerm(item.specialization);
    });

    return Array.from(terms);
  }, [data]);

  const autocomplete = useMemo(() => {
    const clean = normalizeText(cleanQuery);
    if (clean.length < 2) return [];

    const stem = normalizeWord(clean);
    return autocompleteTerms
      .filter((term) => {
        const normalized = normalizeText(term);
        const termStem = normalizeWord(normalized);
        if (!normalized || normalized === clean) return false;
        return normalized.startsWith(clean)
          || normalized.includes(clean)
          || (stem.length >= 2 && termStem.startsWith(stem))
          || (stem.length >= 3 && termStem === stem);
      })
      .sort((a, b) => {
        const aNorm = normalizeText(a);
        const bNorm = normalizeText(b);
        const aStarts = aNorm.startsWith(clean) ? 0 : 1;
        const bStarts = bNorm.startsWith(clean) ? 0 : 1;
        return aStarts - bStarts || aNorm.length - bNorm.length;
      })
      .slice(0, 7);
  }, [autocompleteTerms, cleanQuery]);

  const defaultChipTerms = useMemo(() => {
    const shuffled = [...DEFAULT_QUERIES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  }, []);

  const chipTerms = recentSearches.length ? recentSearches : defaultChipTerms;
  const chipTitle = recentSearches.length ? "Последние запросы" : "Популярные запросы";

  const bestResult = useMemo(() => {
    const entries = groups.flatMap((group) => group.items.map((item) => ({
      label: group.title.slice(0, -1) || group.title,
      title: item.title || item.name || "Без названия",
      href: group.type === "product" ? `/shop/${item.id}` : group.type === "program" ? `/programs/${item.id}` : group.type === "article" ? `/articles/${item.id}` : `/trainers/${item.id}`,
    })));
    return entries[0] || null;
  }, [groups]);

  useEffect(() => {
    if (loading || !cleanQuery || cleanQuery.length < 3 || !count) return undefined;
    const timer = setTimeout(() => {
      setRecentSearches((current) => saveRecentSearch(cleanQuery, current));
    }, 1200);
    return () => clearTimeout(timer);
  }, [cleanQuery, count, loading]);

  function applyQuery(term) {
    const next = term.trim();
    if (!next) return;
    setQuery(next);
    setRecentSearches((current) => saveRecentSearch(next, current));
  }

  return (
    <main className="min-h-screen bg-[color:var(--bg)] pb-20">
      <section className="container-fitlab pt-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/12 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Умный поиск по сайту
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight text-[color:var(--text)] md:text-6xl">
              Найди тренировку, тренера, статью или товар
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] md:text-lg">
              Поиск понимает похожие формы слов: «йога», «йоги», «йогу», «растяжка», «растяжку». Начни вводить запрос — сайт предложит продолжение.
            </p>

            <div className="relative mt-7">
              <div className="rounded-[1.4rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-2 shadow-sm">
                <label className="flex items-center gap-3">
                  <Search className="ml-3 h-5 w-5 text-[color:var(--muted)]" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && cleanQuery) setRecentSearches((current) => saveRecentSearch(cleanQuery, current));
                      if (event.key === "Tab" && autocomplete[0]) {
                        event.preventDefault();
                        applyQuery(autocomplete[0]);
                      }
                    }}
                    placeholder="Например: йога, набор массы, питание, резинки..."
                    className="min-h-12 flex-1 appearance-none border-0 bg-transparent px-0 text-base font-semibold text-[color:var(--text)] outline-none placeholder:text-[color:var(--muted2)]"
                    style={{ backgroundColor: "transparent", boxShadow: "none", WebkitBoxShadow: "0 0 0 1000px transparent inset", WebkitTextFillColor: "currentColor" }}
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

              {autocomplete.length ? (
                <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-[1.4rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-2 shadow-2xl shadow-emerald-950/10">
                  <div className="px-3 py-2 text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">Автопредложение</div>
                  {autocomplete.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applyQuery(term)}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-[color:var(--text)] transition hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300"
                    >
                      <Search className="h-4 w-4 text-[color:var(--muted)]" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">
                <Clock3 className="h-4 w-4" />
                {chipTitle}
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {chipTerms.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => applyQuery(item)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3.5 py-2 text-sm font-semibold text-[color:var(--text)] transition hover:border-emerald-500/30 hover:bg-emerald-500/8 hover:text-emerald-700 dark:hover:text-emerald-300"
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500/70" />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SearchInsights loading={loading} count={count} groups={groups} bestResult={bestResult} cleanQuery={cleanQuery} />

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
              Попробуй другую форму слова или выбери подсказку сверху. Например: «йога», «йоги», «растяжка», «питание».
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

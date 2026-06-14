"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Dumbbell, PenLine, Search, SlidersHorizontal, Sparkles, TrendingUp } from "lucide-react";
import { apiGet } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ArticleCard from "@/components/articles/ArticleCard";
import { ARTICLE_CATEGORIES, unwrapCollection } from "@/lib/articles";

export default function ArticlesPage() {
  const { isAuthed } = useAuth();
  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [trainerOnly, setTrainerOnly] = useState(false);
  const [sort, setSort] = useState("latest");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ per_page: "18", sort });
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (category !== "all") params.set("category", category);
      if (trainerOnly) params.set("trainer", "1");
      const response = await apiGet(`/articles?${params.toString()}`);
      setArticles(unwrapCollection(response));
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось загрузить статьи");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, category, trainerOnly, sort]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    Promise.all([
      apiGet("/articles/featured"),
      apiGet("/articles?sort=popular&per_page=5"),
    ]).then(([featuredResponse, popularResponse]) => {
      setFeatured(featuredResponse?.data ?? featuredResponse ?? null);
      setPopular(unwrapCollection(popularResponse));
    }).catch(() => {});
  }, []);

  const visibleFeatured = useMemo(() => {
    if (debouncedQuery || category !== "all" || trainerOnly) return null;
    return featured;
  }, [featured, debouncedQuery, category, trainerOnly]);

  const gridArticles = visibleFeatured
    ? articles.filter((item) => item.id !== visibleFeatured.id)
    : articles;

  return (
    <main className="pb-20">
      <section className="border-b border-[color:var(--stroke)] bg-[radial-gradient(circle_at_top_left,rgba(34,183,143,.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(34,184,207,.14),transparent_35%)] py-14 sm:py-20">
        <Container size="wide">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-sm font-bold text-emerald-300">
                <BookOpen className="h-4 w-4" /> Журнал НашФит
              </div>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">Знания, которые помогают тренироваться лучше</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
                Практические материалы о тренировках, питании, восстановлении и здоровье. Статьи тренеров отмечены специальным знаком.
              </p>
            </div>
            <Button as={Link} href={isAuthed ? "/account/articles/new" : "/login?next=/account/articles/new"} size="lg">
              <PenLine className="h-5 w-5" /> Написать статью
            </Button>
          </div>
        </Container>
      </section>

      <Container size="wide" className="py-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <label className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--muted)]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Поиск по статьям"
                    className="h-12 w-full rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] pl-12 pr-4 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTrainerOnly((value) => !value)}
                    className={`inline-flex h-12 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition ${trainerOnly ? "border-emerald-400 bg-emerald-400/20 text-emerald-300" : "border-[color:var(--stroke)] text-[color:var(--muted)] hover:text-[color:var(--text)]"}`}
                  >
                    <Dumbbell className="h-4 w-4" /> Только тренеры
                  </button>
                  <label className="relative">
                    <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
                    <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] pl-10 pr-9 text-sm font-semibold outline-none">
                      <option value="latest">Сначала новые</option>
                      <option value="popular">Популярные</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {ARTICLE_CATEGORIES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCategory(item.value)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${category === item.value ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-[color:var(--stroke)] text-[color:var(--muted)] hover:border-emerald-400/50 hover:text-[color:var(--text)]"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {visibleFeatured ? (
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[.16em] text-emerald-400">
                  <Sparkles className="h-4 w-4" /> Выбор редакции
                </div>
                <ArticleCard article={visibleFeatured} featured />
              </div>
            ) : null}

            <div className="mt-10 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Свежие материалы</h2>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Подборка полезных статей для вашего прогресса</p>
              </div>
              <span className="text-sm text-[color:var(--muted)]">{articles.length} материалов</span>
            </div>

            {loading ? (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((item) => <div key={item} className="h-[420px] animate-pulse rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)]" />)}
              </div>
            ) : error ? (
              <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-200">{error}</div>
            ) : gridArticles.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-[color:var(--stroke)] p-14 text-center">
                <Search className="mx-auto h-10 w-10 text-[color:var(--muted)]" />
                <h3 className="mt-4 text-xl font-bold">Ничего не найдено</h3>
                <p className="mt-2 text-[color:var(--muted)]">Попробуйте изменить запрос или выбрать другую категорию.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {gridArticles.map((article) => <ArticleCard key={article.id} article={article} />)}
              </div>
            )}
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h2 className="font-black">Популярное сейчас</h2>
              </div>
              <div className="mt-5 space-y-4">
                {popular.map((article, index) => (
                  <Link key={article.id} href={`/articles/${article.id}`} className="group grid grid-cols-[34px_1fr] gap-3">
                    <span className="text-2xl font-black text-emerald-400/50">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="line-clamp-2 text-sm font-bold leading-5 transition group-hover:text-emerald-400">{article.title}</p>
                      <p className="mt-1 text-xs text-[color:var(--muted)]">{article.views_count || 0} просмотров</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 p-6">
              <Dumbbell className="h-9 w-9 text-emerald-400" />
              <h2 className="mt-5 text-xl font-black">Не только читайте — тренируйтесь</h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">Все программы НашФит бесплатны. Выберите подходящую и отмечайте прогресс по неделям.</p>
              <Button as={Link} href="/programs" className="mt-5 w-full">Подобрать программу</Button>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}

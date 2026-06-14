"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Sparkles, BadgeCheck, Truck, Store, X, ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { apiGet } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function ShopPage() {
  const { isAuthed } = useAuth();
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", category: "", brand: "", sort: "featured", available: true, trainer_pick: false, home_use: false });

  useEffect(() => {
    Promise.all([
      apiGet("/shop/overview"),
      isAuthed ? apiGet("/account/recent-products").catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ]).then(([data, recentData]) => {
      setOverview(data);
      setRecent(recentData?.data || []);
    }).catch((e) => setError(e?.message || "Не удалось загрузить витрину."));
  }, [isAuthed]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value === true) params.set(key, "1");
          else if (value) params.set(key, value);
        });
        params.set("per_page", "24");
        const response = await apiGet(`/products?${params}`);
        setProducts(response?.data || []);
      } catch (e) { setError(e?.message || "Не удалось загрузить товары."); }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  const hasFilters = useMemo(() => filters.q || filters.category || filters.brand || filters.trainer_pick || filters.home_use || filters.sort !== "featured", [filters]);
  const categories = overview?.categories || [];
  const brands = overview?.brands || [];

  return (
    <main className="min-h-screen bg-[color:var(--bg)] pb-20">
      <section className="container-fitlab pt-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] px-6 py-12 md:px-12 md:py-16 dark:border-emerald-400/20 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/70">
          <div className="absolute -right-16 -top-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/15" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300"><Sparkles className="h-4 w-4" /> Маркет НашФит</span>
            <h1 className="mt-5 text-4xl font-black leading-tight text-[color:var(--text)] md:text-6xl dark:text-white">Инвентарь, который помогает тренироваться лучше</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)] md:text-lg dark:text-white/65">Подборки тренеров, товары для ваших программ и всё необходимое для зала, дома и восстановления.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-sm text-[color:var(--muted)] dark:border-white/10 dark:bg-white/5 dark:text-white/75"><BadgeCheck className="mb-2 h-5 w-5 text-cyan-500 dark:text-cyan-300" /> Рекомендации тренеров</div>
              <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-sm text-[color:var(--muted)] dark:border-white/10 dark:bg-white/5 dark:text-white/75"><Truck className="mb-2 h-5 w-5 text-emerald-600 dark:text-emerald-300" /> Доставка бесплатно от 5 000 ₽</div>
              <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-sm text-[color:var(--muted)] dark:border-white/10 dark:bg-white/5 dark:text-white/75"><Store className="mb-2 h-5 w-5 text-amber-600 dark:text-violet-300" /> Самовывоз из клуба</div>
            </div>
          </div>
        </div>
      </section>

      {!hasFilters && overview?.collections?.length ? (
        <section className="container-fitlab mt-10">
          <div className="grid gap-4 md:grid-cols-3">
            {overview.collections.slice(0, 3).map((collection, index) => (
              <button key={collection.id} onClick={() => setFilters((f) => ({ ...f, q: collection.name.split(" ").slice(-1)[0], category: "" }))} className={`group rounded-3xl border p-6 text-left transition hover:-translate-y-1 ${index === 0 ? "border-emerald-400/30 bg-emerald-400/10" : index === 1 ? "border-cyan-400/30 bg-cyan-400/10" : "border-violet-400/30 bg-violet-400/10"}`}>
                <div className="text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">Подборка</div>
                <h2 className="mt-2 text-xl font-black text-[color:var(--text)]">{collection.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{collection.subtitle}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-400">Смотреть <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container-fitlab mt-10">
        <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 md:p-5">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
            <label className="relative"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--muted)]" /><input value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} placeholder="Поиск по товарам и брендам" className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] py-3 pl-12 pr-4 text-[color:var(--text)] outline-none focus:border-emerald-400" /></label>
            <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))} className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none"><option value="">Все категории</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name} ({item.products_count})</option>)}</select>
            <select value={filters.brand} onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))} className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none"><option value="">Все бренды</option>{brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select>
            <select value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))} className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none"><option value="featured">Рекомендуемые</option><option value="popular">Популярные</option><option value="rating">По рейтингу</option><option value="new">Сначала новинки</option><option value="price_asc">Сначала дешевле</option><option value="price_desc">Сначала дороже</option></select>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="mr-1 h-4 w-4 text-[color:var(--muted)]" />
            {[['available','В наличии'],['trainer_pick','Выбор тренера'],['home_use','Для дома']].map(([key,label]) => <button key={key} onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))} className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${filters[key] ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-[color:var(--stroke)] text-[color:var(--muted)] hover:text-[color:var(--text)]"}`}>{label}</button>)}
            {hasFilters ? <button onClick={() => setFilters({ q: "", category: "", brand: "", sort: "featured", available: true, trainer_pick: false, home_use: false })} className="ml-auto inline-flex items-center gap-1 text-sm text-[color:var(--muted)] hover:text-[color:var(--text)]"><X className="h-4 w-4" /> Сбросить</button> : null}
          </div>
        </div>

        <div className="mt-7 flex items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[.18em] text-emerald-400">Каталог</div><h2 className="mt-1 text-3xl font-black text-[color:var(--text)]">Товары для прогресса</h2></div><Link href="/account/favorite-products" className="text-sm font-bold text-emerald-400 hover:text-emerald-300">Моё избранное →</Link></div>
        {error ? <div className="mt-5 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-red-200">{error}</div> : null}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/5] animate-pulse rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)]" />) : products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {!loading && !products.length ? <div className="mt-6 rounded-3xl border border-dashed border-[color:var(--stroke)] p-12 text-center text-[color:var(--muted)]">По выбранным фильтрам товары не найдены.</div> : null}
      </section>

      {recent.length ? <section className="container-fitlab mt-14"><div className="flex items-end justify-between"><div><div className="text-xs font-black uppercase tracking-wider text-cyan-400">История</div><h2 className="mt-1 text-2xl font-black text-[color:var(--text)]">Недавно просмотренные</h2></div></div><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recent.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} compact />)}</div></section> : null}
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { apiGet } from "@/services/api";
import ProductCard from "@/components/ProductCard";

export default function FavoriteProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/account/favorite-products").then((response) => setProducts(response?.data || [])).catch((e) => setError(e?.message || "Не удалось загрузить избранное.")).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6"><div className="text-xs font-black uppercase tracking-[.18em] text-rose-400">Магазин</div><h1 className="mt-1 text-3xl font-black text-[color:var(--text)]">Избранные товары</h1><p className="mt-2 text-[color:var(--muted)]">Сохраняйте товары, чтобы вернуться к ним позже.</p></div>
      {error ? <div className="rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-red-200">{error}</div> : null}
      {loading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-96 animate-pulse rounded-3xl bg-[color:var(--panel)]" />)}</div> : products.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-10 text-center"><Heart className="mx-auto h-12 w-12 text-rose-400" /><h2 className="mt-4 text-xl font-black text-[color:var(--text)]">Пока ничего не сохранено</h2><p className="mt-2 text-[color:var(--muted)]">Нажмите на сердечко в карточке товара.</p><Link href="/shop" className="mt-6 inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950">Перейти в магазин</Link></div>}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Loader2 } from "lucide-react";
import { apiGet } from "@/services/api";
import ArticleCard from "@/components/articles/ArticleCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { unwrapCollection } from "@/lib/articles";

export default function SavedArticlesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    apiGet("/account/favorite-articles")
      .then((response) => alive && setItems(unwrapCollection(response)))
      .catch((e) => alive && setError(e?.data?.message || e?.message || "Не удалось загрузить сохранённые статьи"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[.15em] text-emerald-400">Моя библиотека</p>
        <h1 className="mt-2 text-3xl font-black">Сохранённые статьи</h1>
        <p className="mt-2 text-[color:var(--muted)]">Материалы, к которым вы хотите вернуться позже.</p>
      </div>

      {error ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">{error}</div> : null}
      {loading ? (
        <Card hover={false} className="flex min-h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></Card>
      ) : items.length === 0 ? (
        <Card hover={false} className="py-14 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-[color:var(--muted)]" />
          <h2 className="mt-4 text-xl font-black">Нет сохранённых статей</h2>
          <p className="mt-2 text-[color:var(--muted)]">Нажимайте «Сохранить» на странице понравившегося материала.</p>
          <Button as={Link} href="/articles" className="mt-5">Открыть журнал</Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">{items.map((item) => <ArticleCard key={item.id} article={item} />)}</div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/services/api";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        const data = await apiGet("/articles");
        if (!alive) return;
        setArticles(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.data?.message || e?.message || "Ошибка загрузки статей");
        setArticles([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="container-fitlab py-10">
      <h1 className="text-3xl font-bold">Статьи</h1>
      <p className="mt-2 text-gray-600">Полезные материалы про тренировки и питание</p>

      {loading ? (
        <p className="mt-6">Загрузка...</p>
      ) : err ? (
        <p className="mt-6" style={{ color: "#ffb4b4" }}>
          {err}
        </p>
      ) : articles.length === 0 ? (
        <p className="mt-6">Статьи не найдены</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {articles.map((a) => (
            <li key={a.id} className="border rounded-md p-4">
              <div className="font-semibold">{a.title ?? a.name}</div>
              {a.excerpt ? <div className="text-sm text-gray-600 mt-1">{a.excerpt}</div> : null}

              <Link href={`/articles/${a.id}`} className="underline mt-2 inline-block">
                Читать
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

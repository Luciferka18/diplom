"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiGet } from "@/services/api";
import ArticleEditor from "@/components/articles/ArticleEditor";
import Card from "@/components/ui/Card";

export default function EditArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    apiGet(`/articles/${params.id}`)
      .then((response) => alive && setArticle(response?.data ?? response))
      .catch((e) => alive && setError(e?.data?.message || e?.message || "Не удалось загрузить статью"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [params.id]);

  if (loading) return <Card hover={false} className="flex min-h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[color:var(--accent)]" /></Card>;
  if (error || !article) return <Card hover={false} className="border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] bg-[color:var(--danger-soft)] text-[color:var(--danger)]">{error || "Статья не найдена"}</Card>;

  return <ArticleEditor initialArticle={article} />;
}

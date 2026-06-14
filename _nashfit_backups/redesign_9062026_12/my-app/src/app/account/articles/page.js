"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Edit3, Eye, FileText, Loader2, PenLine, RefreshCw, Trash2 } from "lucide-react";
import { apiDelete, apiGet } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ArticleStatusBadge from "@/components/articles/ArticleStatusBadge";
import { ARTICLE_STATUSES, articleDate, categoryLabel, unwrapCollection } from "@/lib/articles";

const tabs = [
  ["all", "Все"],
  ["draft", "Черновики"],
  ["pending", "На модерации"],
  ["published", "Опубликованные"],
  ["rejected", "Отклонённые"],
];

export default function AccountArticlesPage() {
  const { isTrainer, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const suffix = status === "all" ? "" : `?status=${status}`;
      const response = await apiGet(`/account/articles${suffix}`);
      setItems(unwrapCollection(response));
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось загрузить статьи");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function removeArticle(article) {
    if (!window.confirm(`Удалить статью «${article.title}»?`)) return;
    try {
      await apiDelete(`/articles/${article.id}`);
      setItems((current) => current.filter((item) => item.id !== article.id));
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось удалить статью");
    }
  }

  const summary = useMemo(() => {
    return Object.keys(ARTICLE_STATUSES).reduce((result, key) => {
      result[key] = items.filter((item) => item.status === key).length;
      return result;
    }, {});
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.15em] text-emerald-400">Авторский кабинет</p>
          <h1 className="mt-2 text-3xl font-black">Мои статьи</h1>
          <p className="mt-2 text-[color:var(--muted)]">
            {isTrainer || isAdmin ? "Ваши материалы публикуются без предварительной модерации." : "Создавайте материалы и отправляйте их администратору на проверку."}
          </p>
        </div>
        <Button as={Link} href="/account/articles/new"><PenLine className="h-4 w-4" /> Новая статья</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card hover={false} className="flex items-center gap-4 p-4">
          <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-400"><BookOpen className="h-5 w-5" /></div>
          <div><p className="text-2xl font-black">{items.length}</p><p className="text-sm text-[color:var(--muted)]">Всего материалов</p></div>
        </Card>
        <Card hover={false} className="flex items-center gap-4 p-4">
          <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-400"><Eye className="h-5 w-5" /></div>
          <div><p className="text-2xl font-black">{items.reduce((sum, item) => sum + Number(item.views_count || 0), 0)}</p><p className="text-sm text-[color:var(--muted)]">Просмотров</p></div>
        </Card>
        <Card hover={false} className="flex items-center gap-4 p-4">
          <div className="rounded-xl bg-amber-400/10 p-3 text-amber-300"><FileText className="h-5 w-5" /></div>
          <div><p className="text-2xl font-black">{summary.draft || 0}</p><p className="text-sm text-[color:var(--muted)]">Черновиков</p></div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(([value, label]) => (
            <button key={value} type="button" onClick={() => setStatus(value)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${status === value ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-[color:var(--stroke)] text-[color:var(--muted)]"}`}>
              {label}
            </button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /> Обновить</Button>
      </div>

      {error ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">{error}</div> : null}

      {loading ? (
        <Card hover={false} className="flex min-h-52 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-emerald-400" /></Card>
      ) : items.length === 0 ? (
        <Card hover={false} className="py-14 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-[color:var(--muted)]" />
          <h2 className="mt-4 text-xl font-black">Здесь пока пусто</h2>
          <p className="mt-2 text-[color:var(--muted)]">Создайте первый полезный материал для сообщества НашФит.</p>
          <Button as={Link} href="/account/articles/new" className="mt-5">Начать писать</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((article) => (
            <Card key={article.id} hover={false} className="overflow-hidden p-0">
              <div className="grid sm:grid-cols-[180px_1fr]">
                <div className="min-h-36 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                  {article.cover_image_url ? <img src={article.cover_image_url} alt={article.title} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <ArticleStatusBadge status={article.status} />
                        <span className="text-xs font-semibold text-[color:var(--muted)]">{categoryLabel(article.category)}</span>
                      </div>
                      <h2 className="mt-3 text-xl font-black">{article.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{article.excerpt}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {article.status === "published" ? <Button as={Link} href={`/articles/${article.id}`} size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button> : null}
                      <Button as={Link} href={`/account/articles/${article.id}/edit`} size="sm" variant="outline"><Edit3 className="h-4 w-4" /> Редактировать</Button>
                      <Button size="sm" variant="ghost" className="text-red-300" onClick={() => removeArticle(article)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {article.status === "rejected" && article.rejection_reason ? (
                    <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200"><strong>Причина отклонения:</strong> {article.rejection_reason}</div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-[color:var(--muted)]">
                    <span>Обновлено: {articleDate(article.updated_at)}</span>
                    <span>{article.views_count || 0} просмотров</span>
                    <span>{article.reading_time_minutes || 1} мин чтения</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  BadgeCheck,
  CheckCircle2,
  Edit3,
  Eye,
  FileClock,
  Loader2,
  PenLine,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import { apiGet, apiPatch } from "@/services/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ArticleStatusBadge from "@/components/articles/ArticleStatusBadge";
import { articleDate, categoryLabel, unwrapCollection } from "@/lib/articles";

const FILTERS = [
  ["pending", "На модерации"],
  ["published", "Опубликованные"],
  ["draft", "Черновики"],
  ["rejected", "Отклонённые"],
  ["archived", "Архив"],
  ["all", "Все"],
];

export default function AdminArticlesPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("pending");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ status, per_page: "50" });
      if (query.trim()) params.set("q", query.trim());
      const response = await apiGet(`/admin/articles?${params.toString()}`);
      setItems(unwrapCollection(response));
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось загрузить статьи");
    } finally {
      setLoading(false);
    }
  }, [status, query]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const counts = useMemo(() => ({ total: items.length, trainers: items.filter((item) => item.is_trainer_article).length }), [items]);

  async function moderate(article, nextStatus, reason = null, extra = {}) {
    setBusyId(article.id);
    setError("");
    setSuccess("");
    try {
      await apiPatch(`/admin/articles/${article.id}/moderate`, {
        status: nextStatus,
        rejection_reason: reason,
        ...extra,
      });
      setSuccess(nextStatus === "published" ? "Статья опубликована" : "Статус статьи обновлён");
      await load();
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось изменить статус");
    } finally {
      setBusyId(null);
    }
  }

  function reject(article) {
    const reason = window.prompt("Укажите причину отклонения. Автор увидит её в личном кабинете.");
    if (!reason?.trim()) return;
    moderate(article, "rejected", reason.trim());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-400">Редакция журнала</p>
          <h1 className="mt-2 text-4xl font-black">Статьи</h1>
          <p className="mt-2 text-[color:var(--muted)]">Модерация пользовательских материалов и управление публикациями тренеров.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /> Обновить</Button>
          <Button as={Link} href="/account/articles/new"><PenLine className="h-4 w-4" /> Новая статья</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card hover={false} className="flex items-center gap-4">
          <div className="rounded-xl bg-amber-400/10 p-3 text-amber-300"><FileClock className="h-5 w-5" /></div>
          <div><p className="text-2xl font-black">{status === "pending" ? counts.total : "—"}</p><p className="text-sm text-[color:var(--muted)]">Ожидают проверки</p></div>
        </Card>
        <Card hover={false} className="flex items-center gap-4">
          <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-400"><BadgeCheck className="h-5 w-5" /></div>
          <div><p className="text-2xl font-black">{counts.trainers}</p><p className="text-sm text-[color:var(--muted)]">Материалов тренеров</p></div>
        </Card>
        <Card hover={false} className="flex items-center gap-4">
          <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-400"><Eye className="h-5 w-5" /></div>
          <div><p className="text-2xl font-black">{items.reduce((sum, item) => sum + Number(item.views_count || 0), 0)}</p><p className="text-sm text-[color:var(--muted)]">Просмотров в выборке</p></div>
        </Card>
      </div>

      <Card hover={false} className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map(([value, label]) => (
              <button key={value} type="button" onClick={() => setStatus(value)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${status === value ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-[color:var(--stroke)] text-[color:var(--muted)]"}`}>
                {label}
              </button>
            ))}
          </div>
          <label className="relative min-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по статьям" className="h-11 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] pl-10 pr-3 outline-none focus:border-emerald-400" />
          </label>
        </div>
      </Card>

      {error ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-200">{success}</div> : null}

      {loading ? (
        <Card hover={false} className="flex min-h-72 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></Card>
      ) : items.length === 0 ? (
        <Card hover={false} className="py-16 text-center"><CheckCircle2 className="mx-auto h-11 w-11 text-emerald-400" /><h2 className="mt-4 text-xl font-black">В этом разделе всё чисто</h2><p className="mt-2 text-[color:var(--muted)]">Статей с выбранным статусом нет.</p></Card>
      ) : (
        <div className="space-y-4">
          {items.map((article) => {
            const busy = busyId === article.id;
            return (
              <Card key={article.id} hover={false} className={`overflow-hidden p-0 ${article.is_trainer_article ? "border-emerald-400/30" : ""}`}>
                <div className="grid lg:grid-cols-[190px_1fr_auto]">
                  <div className="min-h-44 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                    {article.cover_image_url ? <img src={article.cover_image_url} alt={article.title} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <ArticleStatusBadge status={article.status} />
                      <span className="text-xs font-semibold text-[color:var(--muted)]">{categoryLabel(article.category)}</span>
                      {article.is_trainer_article ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300"><BadgeCheck className="h-3.5 w-3.5" /> Тренер</span> : null}
                      {article.is_featured ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300"><Star className="h-3.5 w-3.5 fill-amber-300" /> Главная</span> : null}
                    </div>
                    <h2 className="mt-3 text-xl font-black">{article.title}</h2>
                    <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">{article.excerpt}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-[color:var(--muted)]">
                      <span>Автор: <strong className="text-[color:var(--text)]">{article.author?.name || "Не указан"}</strong></span>
                      <span>Обновлено: {articleDate(article.updated_at)}</span>
                      <span>{article.views_count || 0} просмотров</span>
                    </div>
                    {article.rejection_reason ? <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">Причина: {article.rejection_reason}</div> : null}
                  </div>
                  <div className="flex min-w-52 flex-col justify-center gap-2 border-t border-[color:var(--stroke)] p-4 lg:border-l lg:border-t-0">
                    <Button as={Link} href={`/articles/${article.id}`} size="sm" variant="outline"><Eye className="h-4 w-4" /> Просмотр</Button>
                    <Button as={Link} href={`/account/articles/${article.id}/edit`} size="sm" variant="outline"><Edit3 className="h-4 w-4" /> Редактировать</Button>
                    {article.status !== "published" ? <Button size="sm" disabled={busy} onClick={() => moderate(article, "published")}><CheckCircle2 className="h-4 w-4" /> Опубликовать</Button> : null}
                    {article.status === "pending" ? <Button size="sm" variant="outline" disabled={busy} className="border-red-400/30 text-red-300" onClick={() => reject(article)}><XCircle className="h-4 w-4" /> Отклонить</Button> : null}
                    {article.status === "published" ? (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => moderate(article, "published", null, { is_featured: !article.is_featured })}>
                        <Sparkles className="h-4 w-4" /> {article.is_featured ? "Убрать с главной" : "На главную"}
                      </Button>
                    ) : null}
                    {article.status !== "archived" ? <Button size="sm" variant="ghost" disabled={busy} onClick={() => moderate(article, "archived")}><Archive className="h-4 w-4" /> В архив</Button> : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

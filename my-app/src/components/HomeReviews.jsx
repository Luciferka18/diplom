"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Input";

function Stars({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.round(v);
  return (
    <div className="inline-flex gap-1 text-xs" aria-label={`Оценка: ${full} из 5`}>
      {"★★★★★".split("").map((s, i) => (
        <span key={i} className={i < full ? "opacity-100" : "opacity-30"}>{s}</span>
      ))}
    </div>
  );
}

function normalizeReview(r) {
  return {
    id: r?.id ?? `${Math.random()}`,
    rating: r?.rating ?? r?.stars ?? r?.score ?? 5,
    text: r?.text ?? r?.comment ?? r?.content ?? "",
    userName: r?.user?.name ?? r?.author?.name ?? r?.user_name ?? r?.name ?? "Пользователь",
    createdAt: r?.created_at ?? r?.createdAt ?? null,
  };
}

async function fetchLatestReviews() {
  try {
    const a = await apiGet("/reviews");
    if (Array.isArray(a)) return a.map(normalizeReview);
    if (Array.isArray(a?.data)) return a.data.map(normalizeReview);
  } catch {}

  try {
    const h = await apiGet("/home");
    const list = h?.reviews ?? h?.data?.reviews;
    if (Array.isArray(list)) return list.map(normalizeReview);
  } catch {}

  return [];
}

export default function HomeReviews() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [type, setType] = useState("trainer");
  const [itemsLoading, setItemsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [itemId, setItemId] = useState("");

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendOk, setSendOk] = useState("");

  const reviewableType = useMemo(() => {
    if (type === "trainer") return "App\\Models\\Trainer";
    if (type === "program") return "App\\Models\\Program";
    return "App\\Models\\Product";
  }, [type]);

  const reload = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const list = await fetchLatestReviews();
      setReviews(list.slice(0, 12));
    } catch (e) {
      setLoadError(e?.message || "Не удалось загрузить отзывы");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setItemsLoading(true);
      setItems([]);
      setItemId("");
      try {
        const endpoint = type === "trainer" ? "/trainers" : type === "program" ? "/programs" : "/products";
        const data = await apiGet(endpoint);
        const arr = Array.isArray(data) ? data : data?.data;
        if (!cancelled) {
          const normalized = (Array.isArray(arr) ? arr : []).map((x) => ({ id: x?.id, label: x?.name ?? x?.title ?? `#${x?.id}` }));
          setItems(normalized);
          setItemId(normalized[0] ? String(normalized[0].id) : "");
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          setItemId("");
        }
      } finally {
        if (!cancelled) setItemsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [type]);

  const submit = async (e) => {
    e.preventDefault();
    setSendError("");
    setSendOk("");

    if (!user) return setSendError("Нужно войти, чтобы оставить отзыв.");
    if (!itemId) return setSendError("Выбери объект, к которому оставляешь отзыв.");
    if (!text.trim()) return setSendError("Напиши текст отзыва.");

    setSending(true);
    try {
      await apiPost("/reviews", {
        rating: Number(rating),
        text: text.trim(),
        comment: text.trim(),
        content: text.trim(),
        reviewable_type: reviewableType,
        reviewable_id: Number(itemId),
      });

      setSendOk("Отзыв отправлен ✅");
      setText("");
      setRating(5);
      await reload();
    } catch (err) {
      const msg = err?.errors ? JSON.stringify(err.errors) : err?.message || "Не удалось отправить отзыв";
      setSendError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Отзывы</h2>
          <p className="mt-2 text-[color:var(--muted)]">Реальные впечатления пользователей</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" onClick={reload} disabled={loading}>Обновить</Button>
          {!user ? <Button as={Link} href="/login?next=%2F">Войти</Button> : <Badge>Вы вошли: {user?.name || user?.login}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <Card>Загрузка отзывов…</Card>
        ) : loadError ? (
          <Card>Ошибка: {loadError}</Card>
        ) : reviews.length === 0 ? (
          <Card>Пока нет отзывов</Card>
        ) : (
          reviews.map((r) => (
            <Card key={r.id} className="group bg-[color:var(--panel)] border-[color:var(--stroke)]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-[color:var(--accent)] text-sm font-bold text-white flex items-center justify-center">
                    {(r.userName || "П").trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate font-extrabold">{r.userName}</div>
                </div>
                <Stars value={r.rating} />
              </div>
              <div className="mt-3 text-[color:var(--text)] leading-relaxed">{r.text}</div>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8">
        <Card>
          <div className="text-lg font-bold">Оставить отзыв</div>

          {!user && (
            <div className="mt-4 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3 text-sm">
              Чтобы оставить отзыв — нужно <Link className="underline text-[color:var(--accent)]" href="/login?next=%2F">войти</Link>.
            </div>
          )}

          <form onSubmit={submit} className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-[color:var(--text)]">Кому/чему отзыв</label>
              <select className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5" value={type} onChange={(e) => setType(e.target.value)} disabled={sending}>
                <option value="trainer">Тренер</option>
                <option value="program">Программа</option>
                <option value="product">Товар</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-[color:var(--text)]">Выбор</label>
              <select className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5" value={itemId} onChange={(e) => setItemId(e.target.value)} disabled={sending || itemsLoading}>
                {itemsLoading ? <option value="">Загрузка…</option> : items.length === 0 ? <option value="">Нет данных</option> : items.map((it) => <option key={it.id} value={String(it.id)}>{it.label}</option>)}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-[color:var(--text)]">Оценка</label>
              <select className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5" value={rating} onChange={(e) => setRating(Number(e.target.value))} disabled={sending}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-[color:var(--text)]">Текст</label>
              <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Например: тренер всё объяснил понятно, план помог…" disabled={sending} />
            </div>

            {sendError ? <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-[color:var(--text)]">{sendError}</div> : null}
            {sendOk ? <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-[color:var(--text)]">{sendOk}</div> : null}

            <div className="flex justify-end"><Button type="submit" disabled={sending || !user}>{sending ? "Отправка…" : "Отправить"}</Button></div>
          </form>
        </Card>
      </div>
    </section>
  );
}

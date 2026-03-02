"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

function Stars({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.round(v);
  return (
    <div className="stars" aria-label={`Оценка: ${full} из 5`}>
      {"★★★★★".split("").map((s, i) => (
        <span key={i} className={i < full ? "star star--on" : "star"}>
          {s}
        </span>
      ))}
    </div>
  );
}

function normalizeReview(r) {
  // максимально терпимо к разным формам ответа
  return {
    id: r?.id ?? `${Math.random()}`,
    rating: r?.rating ?? r?.stars ?? r?.score ?? 5,
    text: r?.text ?? r?.comment ?? r?.content ?? "",
    userName:
      r?.user?.name ??
      r?.author?.name ??
      r?.user_name ??
      r?.name ??
      "Пользователь",
    createdAt: r?.created_at ?? r?.createdAt ?? null,
  };
}

async function fetchLatestReviews() {
  // 1) пробуем /reviews (если у тебя появится публичный GET)
  try {
    const a = await apiGet("/reviews");
    if (Array.isArray(a)) return a.map(normalizeReview);
    if (Array.isArray(a?.data)) return a.data.map(normalizeReview);
  } catch {}

  // 2) пробуем /home (если backend туда кладёт отзывы)
  try {
    const h = await apiGet("/home");
    const list = h?.reviews ?? h?.data?.reviews;
    if (Array.isArray(list)) return list.map(normalizeReview);
  } catch {}

  // 3) если ничего — пусто
  return [];
}

export default function HomeReviews() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [loadError, setLoadError] = useState("");

  // форма
  const [type, setType] = useState("trainer"); // trainer | program | product
  const [itemsLoading, setItemsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [itemId, setItemId] = useState("");

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendOk, setSendOk] = useState("");

  const reviewableType = useMemo(() => {
    // ВАЖНО: Laravel polymorph обычно ждёт FQCN модели
    // Если у тебя другие неймспейсы — просто поменяй здесь.
    if (type === "trainer") return "App\\Models\\Trainer";
    if (type === "program") return "App\\Models\\Program";
    return "App\\Models\\Product";
  }, [type]);

  const reload = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const list = await fetchLatestReviews();
      setReviews(list.slice(0, 12)); // последние 12
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
    // загрузка списка сущностей для выбора
    let cancelled = false;

    const run = async () => {
      setItemsLoading(true);
      setItems([]);
      setItemId("");
      try {
        const endpoint =
          type === "trainer" ? "/trainers" : type === "program" ? "/programs" : "/products";

        const data = await apiGet(endpoint);

        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const mapped = list.map((x) => ({
          id: x.id,
          label: x.name ?? x.title ?? x.slug ?? `ID ${x.id}`,
        }));

        if (!cancelled) {
          setItems(mapped);
          if (mapped[0]?.id) setItemId(String(mapped[0].id));
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

    if (!user) {
      setSendError("Нужно войти, чтобы оставить отзыв.");
      return;
    }

    if (!itemId) {
      setSendError("Выбери объект, к которому оставляешь отзыв.");
      return;
    }

    if (!text.trim()) {
      setSendError("Напиши текст отзыва.");
      return;
    }

    setSending(true);
    try {
      // кладём несколько вариантов полей — Laravel лишнее проигнорит,
      // а мы попадём в нужную валидацию.
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

      // обновим список
      await reload();
    } catch (err) {
      const msg =
        err?.errors
          ? JSON.stringify(err.errors)
          : err?.message || "Не удалось отправить отзыв";
      setSendError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="reviews-section">
      <div className="reviews-head">
        <div>
          <h2 className="section-title">Отзывы</h2>
          <p className="section-subtitle">Реальные впечатления пользователей</p>
        </div>

        <div className="reviews-actions">
          <button className="btn btn-ghost" onClick={reload} disabled={loading}>
            Обновить
          </button>
          {!user ? (
            <Link className="btn" href="/login?next=%2F">
              Войти
            </Link>
          ) : (
            <span className="pill">Вы вошли: {user?.name || user?.login}</span>
          )}
        </div>
      </div>

      <div className="reviews-grid gap-6 md:gap-7">
        {loading ? (
          <div className="card reviews-empty border border-white/10 bg-white/5">Загрузка отзывов…</div>
        ) : loadError ? (
          <div className="card reviews-empty border border-white/10 bg-white/5">Ошибка: {loadError}</div>
        ) : reviews.length === 0 ? (
          <div className="card reviews-empty border border-white/10 bg-white/5">Пока нет отзывов</div>
        ) : (
          reviews.map((r) => (
            <div
              className="review-card group rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-emerald-300/25 hover:shadow-xl hover:shadow-black/30"
              key={r.id}
            >
              <div className="review-top">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-400/80 to-green-600/80 text-sm font-bold text-white flex items-center justify-center">
                    {(r.userName || "П").trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="review-name font-extrabold">{r.userName}</div>
                </div>
                <Stars value={r.rating} />
              </div>
              <div className="review-text opacity-90">{r.text}</div>
            </div>
          ))
        )}
      </div>

      <div className="reviews-form-wrap">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>
            Оставить отзыв
          </div>

          {!user && (
            <div className="alert" style={{ marginBottom: 12 }}>
              Чтобы оставить отзыв — нужно{" "}
              <Link className="link" href="/login?next=%2F">
                войти
              </Link>
              .
            </div>
          )}

          <form onSubmit={submit} className="reviews-form">
            <div className="form-row">
              <label className="label">Кому/чему отзыв</label>
              <select
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={sending}
              >
                <option value="trainer">Тренер</option>
                <option value="program">Программа</option>
                <option value="product">Товар</option>
              </select>
            </div>

            <div className="form-row">
              <label className="label">Выбор</label>
              <select
                className="input"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                disabled={sending || itemsLoading}
              >
                {itemsLoading ? (
                  <option value="">Загрузка…</option>
                ) : items.length === 0 ? (
                  <option value="">Нет данных</option>
                ) : (
                  items.map((it) => (
                    <option key={it.id} value={String(it.id)}>
                      {it.label}
                    </option>
                  ))
                )}
              </select>
              
            </div>

            <div className="form-row">
              <label className="label">Оценка</label>
              <select
                className="input"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                disabled={sending}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label className="label">Текст</label>
              <textarea
                className="input textarea"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Например: тренер всё объяснил понятно, план помог…"
                disabled={sending}
              />
            </div>

            {sendError ? <div className="alert alert-danger">{sendError}</div> : null}
            {sendOk ? <div className="alert alert-success">{sendOk}</div> : null}

            <div className="form-actions">
              <button className="btn" type="submit" disabled={sending || !user}>
                {sending ? "Отправка…" : "Отправить"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

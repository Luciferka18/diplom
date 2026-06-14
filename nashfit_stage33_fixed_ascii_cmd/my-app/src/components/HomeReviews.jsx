"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

function normalizeList(response, fallbackKey) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.[fallbackKey])) return response[fallbackKey];

  return [];
}

function normalizeReview(review) {
  return {
    id: review?.id ?? `${Math.random()}`,
    rating: Number(review?.rating ?? review?.stars ?? review?.score ?? 5),
    text: review?.text ?? review?.comment ?? review?.content ?? "",
    userName:
      review?.user?.name ??
      review?.user?.login ??
      review?.author?.name ??
      review?.user_name ??
      review?.name ??
      "Пользователь",
    userAvatar:
      review?.user?.avatar_url ??
      review?.user?.photo_url ??
      review?.author?.avatar_url ??
      review?.avatar_url ??
      null,
    createdAt: review?.created_at ?? review?.createdAt ?? null,

    targetLabel:
      review?.target_label ??
      review?.target?.label ??
      getTargetFallback(review),
  };
}

function getTargetFallback(review) {
  const type = review?.reviewable_type;
  const id = review?.reviewable_id;

  if (!type) return "Отзыв";

  if (type === "site" || type === "gym" || type === "club" || type === "fitlab") {
    return "Зал: НашФит";
  }

  if (String(type).includes("Trainer") || type === "trainer") {
    return id ? `Тренер #${id}` : "Тренер";
  }

  if (String(type).includes("Program") || type === "program") {
    return id ? `Программа #${id}` : "Программа";
  }

  if (String(type).includes("Product") || type === "product") {
    return id ? `Товар #${id}` : "Товар";
  }

  return "Отзыв";
}

function Stars({ value = 0, interactive = false, onChange }) {
  const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
  const [hover, setHover] = useState(0);
  const activeValue = hover || safeValue;

  return (
    <div className="inline-flex gap-1" aria-label={`Оценка: ${safeValue} из 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= activeValue;

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange?.(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="text-3xl leading-none transition-transform hover:scale-110"
              aria-label={`${star} из 5`}
            >
              <span className={active ? "text-[color:var(--warning)]" : "text-[color:var(--stroke-strong)]"}>
                ★
              </span>
            </button>
          );
        }

        return (
          <span
            key={star}
            className={active ? "text-[color:var(--warning)]" : "text-[color:var(--stroke-strong)]"}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

function getErrorMessage(error, fallback = "Ошибка") {
  if (error?.data?.errors) {
    const firstKey = Object.keys(error.data.errors)[0];
    const firstValue = error.data.errors[firstKey];

    if (Array.isArray(firstValue)) {
      return firstValue[0] || fallback;
    }

    return String(firstValue || fallback);
  }

  return error?.data?.message || error?.message || fallback;
}

const TARGET_TYPES = [
  {
    value: "site",
    label: "Зал НашФит",
    endpoint: null,
    reviewableType: "site",
  },
  {
    value: "trainer",
    label: "Тренер",
    endpoint: "/trainers",
    reviewableType: "App\\Models\\Trainer",
  },
  {
    value: "program",
    label: "Программа",
    endpoint: "/programs",
    reviewableType: "App\\Models\\Program",
  },
  {
    value: "product",
    label: "Товар",
    endpoint: "/products",
    reviewableType: "App\\Models\\Product",
  },
];

export default function HomeReviews() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  const [targetType, setTargetType] = useState("site");
  const [targetItems, setTargetItems] = useState([]);
  const [targetItemId, setTargetItemId] = useState("1");
  const [targetItemsLoading, setTargetItemsLoading] = useState(false);

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const selectedTarget = useMemo(
    () => TARGET_TYPES.find((item) => item.value === targetType) ?? TARGET_TYPES[0],
    [targetType]
  );

  async function loadReviews() {
    setReviewsLoading(true);
    setReviewsError("");

    try {
      const response = await apiGet("/reviews?limit=6");
      const list = normalizeList(response, "reviews").map(normalizeReview);

      setReviews(list);
    } catch (error) {
      setReviews([]);
      setReviewsError(getErrorMessage(error, "Не удалось загрузить отзывы"));
    } finally {
      setReviewsLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTargetItems() {
      setSendError("");
      setSendSuccess("");

      if (!selectedTarget.endpoint) {
        setTargetItems([]);
        setTargetItemId("1");
        return;
      }

      setTargetItemsLoading(true);
      setTargetItems([]);
      setTargetItemId("");

      try {
        const response = await apiGet(selectedTarget.endpoint);
        const list = normalizeList(response, selectedTarget.value)
          .filter((item) => item?.id)
          .map((item) => ({
            id: item.id,
            label: item.name ?? item.title ?? `#${item.id}`,
          }));

        if (!cancelled) {
          setTargetItems(list);
          setTargetItemId(list[0] ? String(list[0].id) : "");
        }
      } catch {
        if (!cancelled) {
          setTargetItems([]);
          setTargetItemId("");
        }
      } finally {
        if (!cancelled) {
          setTargetItemsLoading(false);
        }
      }
    }

    loadTargetItems();

    return () => {
      cancelled = true;
    };
  }, [selectedTarget]);

  const canSubmit = useMemo(() => {
    if (!user) return false;
    if (sending) return false;
    if (!text.trim() || text.trim().length < 10) return false;

    if (selectedTarget.endpoint && !targetItemId) return false;

    return true;
  }, [user, sending, text, selectedTarget, targetItemId]);

  async function submitReview(event) {
    event.preventDefault();

    setSendError("");
    setSendSuccess("");

    if (!user) {
      setSendError("Нужно войти, чтобы оставить отзыв.");
      return;
    }

    if (!canSubmit) {
      setSendError("Заполни текст отзыва минимум на 10 символов.");
      return;
    }

    setSending(true);

    try {
      await apiPost("/reviews", {
        rating: Number(rating),
        text: text.trim(),
        reviewable_type: selectedTarget.reviewableType,
        reviewable_id: selectedTarget.endpoint ? Number(targetItemId) : 1,
      });

      setText("");
      setRating(5);
      setSendSuccess("Отзыв отправлен ✅");

      await loadReviews();

      setTimeout(() => setSendSuccess(""), 3000);
    } catch (error) {
      setSendError(getErrorMessage(error, "Не удалось отправить отзыв"));
    } finally {
      setSending(false);
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Отзывы</h2>
          <p className="mt-2 text-[color:var(--muted)]">
            Реальные впечатления пользователей о зале, тренерах, программах и товарах.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={loadReviews} disabled={reviewsLoading}>
            Обновить
          </Button>

          {!user ? (
            <Button as={Link} href="/login?next=%2F">
              Войти
            </Button>
          ) : (
            <Badge>
              Вы вошли: {user?.name || user?.login || "Пользователь"}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div>
          {reviewsLoading ? (
            <Card hover={false} className="p-6">
              Загрузка отзывов…
            </Card>
          ) : reviewsError ? (
            <Card hover={false} className="p-6 border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] bg-[color:var(--danger-soft)]">
              <p className="text-[color:var(--danger)]">{reviewsError}</p>
            </Card>
          ) : reviews.length === 0 ? (
            <Card hover={false} className="p-6">
              Пока нет отзывов.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reviews.map((review) => (
                <Card
                  key={review.id}
                  hover={false}
                  className="p-5 bg-[color:var(--panel)] border-[color:var(--stroke)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[color:var(--accent)] text-sm font-bold text-[color:var(--on-accent)] flex items-center justify-center">
                        {review.userAvatar ? (
                          <img src={review.userAvatar} alt={review.userName || ""} className="h-full w-full object-cover" />
                        ) : (
                          (review.userName || "П").trim().charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate font-extrabold text-[color:var(--text)]">
                          {review.userName}
                        </div>

                        {review.createdAt ? (
                          <div className="text-xs text-[color:var(--muted)]">
                            {new Date(review.createdAt).toLocaleDateString("ru-RU", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        ) : null}
                        {review.targetLabel ? (
                          <div className="mt-1 inline-flex rounded-full border border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[color:var(--accent)]">
                            {review.targetLabel}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <Stars value={review.rating} />
                  </div>

                  <p className="mt-4 text-[color:var(--text)] leading-relaxed whitespace-pre-wrap">
                    {review.text || "—"}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card hover={false} className="p-6">
          <div className="text-lg font-bold text-[color:var(--text)]">
            Оставить отзыв
          </div>

          {!user ? (
            <div className="mt-4 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3 text-sm text-[color:var(--text)]">
              Чтобы оставить отзыв, нужно{" "}
              <Link
                className="text-[color:var(--accent)] underline"
                href="/login?next=%2F"
              >
                войти
              </Link>
              .
            </div>
          ) : null}

          <form onSubmit={submitReview} className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-[color:var(--text)]">
                Кому/чему отзыв
              </label>

              <select
                className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]"
                value={targetType}
                onChange={(event) => setTargetType(event.target.value)}
                disabled={sending}
              >
                {TARGET_TYPES.map((target) => (
                  <option key={target.value} value={target.value}>
                    {target.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedTarget.endpoint ? (
              <div className="grid gap-2">
                <label className="text-sm text-[color:var(--text)]">
                  Выбор
                </label>

                <select
                  className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]"
                  value={targetItemId}
                  onChange={(event) => setTargetItemId(event.target.value)}
                  disabled={sending || targetItemsLoading}
                >
                  {targetItemsLoading ? (
                    <option value="">Загрузка…</option>
                  ) : targetItems.length === 0 ? (
                    <option value="">Нет данных</option>
                  ) : (
                    targetItems.map((item) => (
                      <option key={item.id} value={String(item.id)}>
                        {item.label}
                      </option>
                    ))
                  )}
                </select>
              </div>
            ) : null}

            <div className="grid gap-2">
              <label className="text-sm text-[color:var(--text)]">
                Оценка
              </label>

              <Stars value={rating} interactive onChange={setRating} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-[color:var(--text)]">
                Текст
              </label>

              <textarea
                rows={5}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={
                  targetType === "site"
                    ? "Например: понравился зал, сервис и атмосфера…"
                    : "Например: тренер всё объяснил понятно, программа помогла…"
                }
                disabled={sending}
                className="w-full resize-y rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] placeholder:text-[color:var(--muted2)] outline-none focus:border-[color:var(--accent)]"
              />

              <p className="text-xs text-[color:var(--muted)]">
                Минимум 10 символов
              </p>
            </div>

            {sendError ? (
              <div className="rounded-xl border border-red-400/40 bg-[color:var(--danger-soft)] p-3 text-sm text-[color:var(--danger)]">
                {sendError}
              </div>
            ) : null}

            {sendSuccess ? (
              <div className="rounded-xl border border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] p-3 text-sm text-[color:var(--accent)]">
                {sendSuccess}
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={!canSubmit}>
                {sending ? "Отправка…" : "Отправить"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
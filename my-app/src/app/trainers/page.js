import { apiGet } from "@/services/api";
import Link from "next/link";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Star } from "lucide-react";

function Stars({ value = 0, size = "sm" }) {
  const v = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  const sizeClass = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="inline-flex gap-0.5" aria-label={`Оценка: ${v} из 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= v
              ? "fill-yellow-400 text-yellow-400"
              : "text-[color:var(--stroke)]"
          }`}
        />
      ))}
    </div>
  );
}

export default async function TrainersPage() {
  let trainers = [];

  try {
    const response = await apiGet("/trainers");
    trainers = Array.isArray(response) ? response : (response?.data ?? []);
  } catch (e) {
    console.error("[trainers] failed to load list", e);
    trainers = [];
  }

  return (
    <Section
      title="Наши тренеры"
      subtitle="Профессионалы, которые приведут тебя к результату"
    >
      {trainers.length === 0 ? (
        <Card>Тренеры не найдены</Card>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trainers.map((t) => (
            <li key={t.id}>
              <Card className="h-full flex flex-col" hover={false}>
                {/* Фото */}
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)]">
                  {t.photo_url ? (
                    <img
                      src={t.photo_url}
                      alt={t.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[color:var(--panel)] to-[color:var(--stroke)]">
                      <svg className="w-20 h-20 text-[color:var(--muted)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Информация */}
                <div className="mt-4 flex-1">
                  <div className="font-bold text-lg text-[color:var(--text)]">{t.name}</div>
                  <div className="text-sm text-[color:var(--accent)] mt-1">{t.specialization || "Персональный тренер"}</div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-[color:var(--muted)]">
                    <span>{t.experience_years} {t.experience_years === 1 ? "год" : t.experience_years >= 2 && t.experience_years <= 4 ? "года" : "лет"} опыта</span>
                    {t.age && <span>· {t.age} лет</span>}
                  </div>

                  {/* Рейтинг */}
                  {t.reviews_count > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <Stars value={t.avg_rating} />
                      <span className="text-sm font-semibold text-[color:var(--text)]">{t.avg_rating}</span>
                      <span className="text-xs text-[color:var(--muted)]">({t.reviews_count} {t.reviews_count === 1 ? "отзыв" : t.reviews_count >= 2 && t.reviews_count <= 4 ? "отзыва" : "отзывов"})</span>
                    </div>
                  )}

                  {/* Краткое био */}
                  {t.bio && (
                    <p className="mt-3 text-sm text-[color:var(--muted)] line-clamp-3">{t.bio}</p>
                  )}
                </div>

                {/* Кнопка */}
                <div className="mt-4">
                  <Button as={Link} href={`/trainers/${t.id}`} variant="outline" className="w-full">
                    Подробнее
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

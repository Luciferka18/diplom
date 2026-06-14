import { apiGet } from "@/services/api";
import Link from "next/link";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Calendar, Clock, MapPin, Star } from "lucide-react";

function normalizeList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function Stars({ value = 0, size = "sm" }) {
  const v = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  const sizeClass = size === "lg" ? "w-5 h-5" : "w-4 h-4";

  return (
    <div className="inline-flex gap-0.5" aria-label={`Оценка: ${v} из 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= v ? "fill-yellow-400 text-yellow-400" : "text-[color:var(--stroke)]"
          }`}
        />
      ))}
    </div>
  );
}

function formatTime(value) {
  return String(value || "").slice(0, 5);
}

function schedulePreview(schedules = []) {
  const list = Array.isArray(schedules) ? schedules : [];

  if (list.length === 0) {
    return <div className="text-xs text-[color:var(--muted)]">Расписание пока не заполнено</div>;
  }

  return (
    <div className="space-y-2">
      {list.slice(0, 3).map((schedule) => (
        <div
          key={schedule.id}
          className="rounded-lg border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2 text-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 font-semibold text-[color:var(--text)]">
              <Calendar className="h-3.5 w-3.5 text-[color:var(--accent)]" />
              {schedule.day_name || `День ${schedule.day_of_week}`}
            </span>
            <span className="flex items-center gap-1 text-[color:var(--muted)]">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(schedule.start_time)} — {formatTime(schedule.end_time)}
            </span>
          </div>
          {schedule.location_name ? (
            <div className="mt-1 flex items-center gap-1 text-[color:var(--muted)]">
              <MapPin className="h-3.5 w-3.5" />
              {schedule.location_name}
            </div>
          ) : null}
        </div>
      ))}

      {list.length > 3 ? (
        <div className="text-xs text-[color:var(--muted)]">Ещё {list.length - 3} дн.</div>
      ) : null}
    </div>
  );
}

export default async function TrainersPage() {
  let trainers = [];

  try {
    const response = await apiGet("/trainers");
    trainers = normalizeList(response);
  } catch (error) {
    console.error("[trainers] failed to load list", error);
    trainers = [];
  }

  return (
    <Section
      title="Наши тренеры"
      subtitle="Выбери тренера, посмотри расписание и запишись на удобное время"
    >
      {trainers.length === 0 ? (
        <Card>Тренеры не найдены</Card>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <li key={trainer.id}>
              <Card className="h-full flex flex-col" hover={false}>
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)]">
                  {trainer.photo_url ? (
                    <img
                      src={trainer.photo_url}
                      alt={trainer.name}
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

                <div className="mt-4 flex-1">
                  <div className="font-bold text-lg text-[color:var(--text)]">{trainer.name}</div>
                  <div className="text-sm text-[color:var(--accent)] mt-1">
                    {trainer.specialization || "Персональный тренер"}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-[color:var(--muted)]">
                    <span>{trainer.experience_years || 0} лет опыта</span>
                    {trainer.age ? <span>· {trainer.age} лет</span> : null}
                  </div>

                  {trainer.reviews_count > 0 ? (
                    <div className="mt-3 flex items-center gap-2">
                      <Stars value={trainer.avg_rating} />
                      <span className="text-sm font-semibold text-[color:var(--text)]">{trainer.avg_rating}</span>
                      <span className="text-xs text-[color:var(--muted)]">({trainer.reviews_count})</span>
                    </div>
                  ) : null}

                  {trainer.bio ? (
                    <p className="mt-3 text-sm text-[color:var(--muted)] line-clamp-3">{trainer.bio}</p>
                  ) : null}

                  <div className="mt-4">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">
                      Ближайшее расписание
                    </div>
                    {schedulePreview(trainer.schedules)}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button as={Link} href={`/trainers/${trainer.id}`} variant="outline" className="w-full">
                    Подробнее
                  </Button>
                  <Button as={Link} href={`/booking?trainerId=${trainer.id}`} variant="primary" className="w-full">
                    Записаться
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

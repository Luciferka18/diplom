"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  Star,
  Phone,
  Mail,
  Calendar,
  Award,
  User,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";

const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

function Stars({ value = 0, size = "md" }) {
  const v = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  const sizeClass = size === "lg" ? "w-6 h-6" : "w-4 h-4";

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

function pluralizeReviews(count) {
  if (count === 1) return "отзыв";
  if (count >= 2 && count <= 4) return "отзыва";
  return "отзывов";
}

function pluralizeYears(count) {
  if (count === 1) return "год";
  if (count >= 2 && count <= 4) return "года";
  return "лет";
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year, month, day) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function timeHHMM(value) {
  return String(value || "").slice(0, 5);
}

export default function TrainerDetailPage({ params: serverParams }) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      const params =
        serverParams && typeof serverParams.then === "function"
          ? await serverParams
          : serverParams;

      if (alive) setResolvedParams(params);
    })();

    return () => {
      alive = false;
    };
  }, [serverParams]);

  if (!resolvedParams) {
    return (
      <Section>
        <div className="py-20 text-center text-[color:var(--muted)]">Загрузка...</div>
      </Section>
    );
  }

  return <TrainerContent params={resolvedParams} router={router} />;
}

function TrainerContent({ params, router }) {
  const id = params?.id;
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    let alive = true;

    (async () => {
      setLoading(true);

      try {
        const response = await apiGet(`/trainers/${id}`);
        const data = response?.data ?? response;
        if (alive) setTrainer(data);
      } catch (error) {
        console.error("[trainer] failed to load", error);
        if (alive) setTrainer(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const loadSlots = useCallback(
    async (date) => {
      if (!id || !date) {
        setAvailableSlots([]);
        return;
      }

      setSlotsLoading(true);

      try {
        const data = await apiGet(`/trainers/${id}/available-slots?date=${date}`);
        setAvailableSlots(Array.isArray(data?.slots) ? data.slots : []);
      } catch (error) {
        console.error("[trainer] failed to load slots", error);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    },
    [id]
  );

  const handleDateSelect = (day) => {
    const date = formatDate(currentYear, currentMonth, day);
    setSelectedDate(date);
    loadSlots(date);
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }
  };

  const trainerWorksOnDay = useCallback(
    (dayOfWeek) => {
      if (!Array.isArray(trainer?.schedules)) return false;
      return trainer.schedules.some((schedule) => Number(schedule.day_of_week) === Number(dayOfWeek));
    },
    [trainer]
  );

  const isDatePast = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(currentYear, currentMonth, day);
    return selected < today;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const goToBooking = (slot) => {
    const params = new URLSearchParams({
      trainerId: String(trainer.id),
      date: selectedDate,
      time: slot.time,
      duration: String(slot.duration_minutes || 60),
    });

    if (slot.location_id) {
      params.set("locationId", String(slot.location_id));
    }

    router.push(`/booking?${params.toString()}`);
  };

  if (loading) {
    return (
      <Section>
        <div className="py-20 text-center text-[color:var(--muted)]">Загрузка...</div>
      </Section>
    );
  }

  if (!trainer) {
    return (
      <Section>
        <div className="text-center py-20">
          <p className="text-[color:var(--muted)]">Тренер не найден</p>
          <Button as={Link} href="/trainers" variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к тренерам
          </Button>
        </div>
      </Section>
    );
  }

  const reviews = Array.isArray(trainer.reviews) ? trainer.reviews : [];
  const schedules = Array.isArray(trainer.schedules) ? trainer.schedules : [];
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarCells = [];

  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = formatDate(currentYear, currentMonth, day);
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
    const works = trainerWorksOnDay(dayOfWeek);
    const past = isDatePast(day);
    const today = isToday(day);
    const selected = selectedDate === date;

    calendarCells.push(
      <button
        key={day}
        onClick={() => !past && handleDateSelect(day)}
        disabled={past}
        className={`relative h-10 w-full rounded-lg text-sm font-medium transition-all ${
          past ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:bg-[color:var(--accent)]/20"
        } ${today ? "ring-2 ring-[color:var(--accent)]" : ""} ${
          selected ? "bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent)]" : ""
        } ${works && !past && !selected ? "text-[color:var(--accent)] font-bold" : ""}`}
        title={works ? "Тренер работает" : "Тренер не работает"}
      >
        {day}
        {works && !past ? (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[color:var(--accent)]" />
        ) : null}
      </button>
    );
  }

  return (
    <Section>
      <div className="mb-6">
        <Button as={Link} href="/trainers" variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Все тренеры
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Card hover={false} className="overflow-hidden">
            <div className="w-full aspect-[3/4] overflow-hidden bg-[color:var(--panel)]">
              {trainer.photo_url ? (
                <img src={trainer.photo_url} alt={trainer.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[color:var(--panel)] to-[color:var(--stroke)]">
                  <svg className="w-32 h-32 text-[color:var(--muted)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
              )}
            </div>
          </Card>

          <Card hover={false}>
            <h3 className="text-lg font-bold text-[color:var(--text)] mb-4">Расписание</h3>

            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[color:var(--panel)] transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-[color:var(--text)]">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[color:var(--panel)] transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES.map((dayName) => (
                <div key={dayName} className="text-center text-xs font-medium text-[color:var(--muted)] py-1">
                  {dayName}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">{calendarCells}</div>

            <div className="mt-3 flex items-center gap-4 text-xs text-[color:var(--muted)]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[color:var(--accent)]" /> Рабочий день
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded ring-2 ring-[color:var(--accent)]" /> Сегодня
              </span>
            </div>
          </Card>

          {selectedDate ? (
            <Card hover={false}>
              <h3 className="text-lg font-bold text-[color:var(--text)] mb-3">
                {new Date(selectedDate).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                })}
              </h3>

              {slotsLoading ? (
                <p className="text-sm text-[color:var(--muted)]">Загрузка слотов...</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-[color:var(--muted)]">Нет доступных слотов</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={`${slot.schedule_id}-${slot.time}`}
                      onClick={() => goToBooking(slot)}
                      className="flex flex-col items-center justify-center gap-1 rounded-lg border border-[color:var(--stroke)] bg-[color:var(--panel)] px-2 py-2 text-xs font-medium text-[color:var(--text)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {slot.time}
                      </span>
                      {slot.location_name ? (
                        <span className="text-[10px] text-[color:var(--muted)]">{slot.location_name}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          ) : null}

          <Card hover={false}>
            <h3 className="text-lg font-bold text-[color:var(--text)] mb-4">Контактная информация</h3>
            <ul className="space-y-3 text-sm">
              {trainer.phone ? (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[color:var(--accent)] flex-shrink-0" />
                  <a href={`tel:${trainer.phone}`} className="text-[color:var(--text)] hover:text-[color:var(--accent)] transition">
                    {trainer.phone}
                  </a>
                </li>
              ) : null}
              {trainer.instagram ? (
                <li className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[color:var(--accent)] flex-shrink-0" />
                  <span className="text-[color:var(--text)]">{trainer.instagram}</span>
                </li>
              ) : null}
              {trainer.user?.email ? (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[color:var(--accent)] flex-shrink-0" />
                  <a href={`mailto:${trainer.user.email}`} className="text-[color:var(--text)] hover:text-[color:var(--accent)] transition">
                    {trainer.user.email}
                  </a>
                </li>
              ) : null}
            </ul>

            <div className="mt-5">
              <Button as={Link} href={`/booking?trainerId=${trainer.id}`} variant="primary" className="w-full">
                Записаться на тренировку
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card hover={false}>
            <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--text)]">{trainer.name}</h1>
            {trainer.specialization ? (
              <p className="mt-2 text-[color:var(--accent)] font-semibold">{trainer.specialization}</p>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)] p-4 text-center">
                <Award className="w-6 h-6 text-[color:var(--accent)] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[color:var(--text)]">{trainer.experience_years || 0}</div>
                <div className="text-xs text-[color:var(--muted)]">{pluralizeYears(trainer.experience_years || 0)} опыта</div>
              </div>
              {trainer.age ? (
                <div className="rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)] p-4 text-center">
                  <Calendar className="w-6 h-6 text-[color:var(--accent)] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[color:var(--text)]">{trainer.age}</div>
                  <div className="text-xs text-[color:var(--muted)]">лет</div>
                </div>
              ) : null}
            </div>

            {trainer.reviews_count > 0 ? (
              <div className="mt-5 flex items-center gap-3">
                <Stars value={trainer.avg_rating} size="lg" />
                <span className="text-xl font-bold text-[color:var(--text)]">{trainer.avg_rating}</span>
                <span className="text-sm text-[color:var(--muted)]">
                  {trainer.reviews_count} {pluralizeReviews(trainer.reviews_count)}
                </span>
              </div>
            ) : null}

            {schedules.length > 0 ? (
              <div className="mt-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--text)] mb-2">
                  График работы
                </h3>
                <div className="space-y-2">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex flex-wrap items-center justify-between gap-2 text-sm rounded-lg bg-[color:var(--panel)] border border-[color:var(--stroke)] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[color:var(--accent)]" />
                        <span className="font-medium text-[color:var(--text)]">{schedule.day_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[color:var(--muted)]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{timeHHMM(schedule.start_time)} — {timeHHMM(schedule.end_time)}</span>
                      </div>
                      {schedule.location_name ? (
                        <div className="flex items-center gap-1 text-[color:var(--muted)]">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs">{schedule.location_name}</span>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {trainer.bio ? (
              <div className="mt-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--text)] mb-2">О тренере</h3>
                <p className="text-[color:var(--text)] leading-relaxed whitespace-pre-wrap">{trainer.bio}</p>
              </div>
            ) : null}
          </Card>

          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[color:var(--text)]">Отзывы</h3>
              {trainer.reviews_count > 0 ? (
                <Badge>
                  {trainer.reviews_count} {pluralizeReviews(trainer.reviews_count)}
                </Badge>
              ) : null}
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-10 h-10 text-[color:var(--stroke)] mx-auto mb-3" />
                <p className="text-[color:var(--muted)] text-sm">Пока нет отзывов</p>
                <p className="text-[color:var(--muted)] text-xs mt-1">Будьте первым, кто оставит отзыв</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const userName = review.user?.name || review.user?.login || "Пользователь";
                  const initial = userName.trim().charAt(0).toUpperCase();

                  return (
                    <div key={review.id} className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[color:var(--accent)] text-sm font-bold text-white flex items-center justify-center flex-shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[color:var(--text)]">{userName}</div>
                            <Stars value={review.rating} />
                          </div>
                        </div>
                        {review.created_at ? (
                          <span className="text-xs text-[color:var(--muted)] flex-shrink-0">
                            {new Date(review.created_at).toLocaleDateString("ru-RU", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        ) : null}
                      </div>
                      {review.text ? (
                        <p className="mt-3 text-sm text-[color:var(--text)] leading-relaxed whitespace-pre-wrap">{review.text}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Section>
  );
}

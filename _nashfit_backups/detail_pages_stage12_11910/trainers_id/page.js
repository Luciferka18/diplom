"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  AtSign,
  Dumbbell,
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
  const number = Number(count || 0);
  const last = number % 10;
  const lastTwo = number % 100;
  if (last === 1 && lastTwo !== 11) return "отзыв";
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "отзыва";
  return "отзывов";
}

function pluralizeYears(count) {
  const number = Number(count || 0);
  const last = number % 10;
  const lastTwo = number % 100;
  if (last === 1 && lastTwo !== 11) return "год";
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "года";
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

function uniqueLocations(schedules) {
  const map = new Map();
  for (const schedule of schedules || []) {
    if (schedule?.location_id && schedule?.location_name) {
      map.set(schedule.location_id, schedule.location_name);
    }
  }
  return Array.from(map.values());
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
  const [selectedSlot, setSelectedSlot] = useState(null);
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
        setSelectedSlot(null);
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
    setSelectedSlot(null);
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

  const schedules = Array.isArray(trainer?.schedules) ? trainer.schedules : [];
  const locations = useMemo(() => uniqueLocations(schedules), [schedules]);

  const trainerWorksOnDay = useCallback(
    (dayOfWeek) => schedules.some((schedule) => Number(schedule.day_of_week) === Number(dayOfWeek)),
    [schedules]
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

  const goToBooking = () => {
    if (!selectedDate || !selectedSlot) return;

    const query = new URLSearchParams({
      trainer: String(trainer.id),
      date: selectedDate,
      time: selectedSlot.time,
    });

    if (selectedSlot.location_id) {
      query.set("locationId", String(selectedSlot.location_id));
    }

    router.push(`/booking?${query.toString()}`);
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
    const disabled = past || !works;

    calendarCells.push(
      <button
        key={day}
        type="button"
        onClick={() => !disabled && handleDateSelect(day)}
        disabled={disabled}
        className={`relative h-11 rounded-xl text-sm font-semibold transition-all ${
          disabled ? "cursor-not-allowed opacity-35" : "hover:bg-[color:var(--accent)]/10"
        } ${today ? "ring-2 ring-[color:var(--accent)]/45" : ""} ${
          selected ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--text)]"
        } ${works && !past && !selected ? "border border-[color:var(--accent)]/25 text-[color:var(--accent)]" : ""}`}
        title={works ? "Тренер принимает в этот день" : "В этот день тренер не принимает"}
      >
        {day}
        {works && !past ? (
          <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[color:var(--accent)]" />
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

      <article className="overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
          <div className="relative min-h-[360px] bg-[color:var(--bg)]">
            {trainer.photo_url ? (
              <img src={trainer.photo_url} alt={trainer.name} className="h-full min-h-[360px] w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center bg-[color:var(--bg)]">
                <User className="h-24 w-24 text-[color:var(--muted)]" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 lg:hidden">
              <div className="text-2xl font-black text-white">{trainer.name}</div>
              {trainer.specialization ? <div className="mt-1 text-white/80">{trainer.specialization}</div> : null}
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10">
            <div className="hidden lg:block">
              <Badge>Тренер НашФит</Badge>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-[color:var(--text)]">{trainer.name}</h1>
              {trainer.specialization ? (
                <p className="mt-3 max-w-3xl text-xl font-semibold text-[color:var(--accent)]">{trainer.specialization}</p>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                <Award className="mb-2 h-5 w-5 text-[color:var(--accent)]" />
                <div className="text-2xl font-black text-[color:var(--text)]">{trainer.experience_years || 0}</div>
                <div className="text-xs text-[color:var(--muted)]">{pluralizeYears(trainer.experience_years || 0)} опыта</div>
              </div>
              {trainer.age ? (
                <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                  <Calendar className="mb-2 h-5 w-5 text-[color:var(--accent)]" />
                  <div className="text-2xl font-black text-[color:var(--text)]">{trainer.age}</div>
                  <div className="text-xs text-[color:var(--muted)]">лет</div>
                </div>
              ) : null}
              <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                <Star className="mb-2 h-5 w-5 text-yellow-400" />
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-black text-[color:var(--text)]">{trainer.avg_rating || "—"}</div>
                  {trainer.reviews_count > 0 ? <Stars value={trainer.avg_rating} /> : null}
                </div>
                <div className="text-xs text-[color:var(--muted)]">
                  {trainer.reviews_count || 0} {pluralizeReviews(trainer.reviews_count || 0)}
                </div>
              </div>
            </div>

            {trainer.bio ? (
              <p className="mt-6 max-w-4xl whitespace-pre-wrap text-base leading-8 text-[color:var(--text)]">{trainer.bio}</p>
            ) : null}

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {trainer.phone ? (
                <a href={`tel:${trainer.phone}`} className="flex items-center gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-[color:var(--text)] transition hover:border-[color:var(--accent)]">
                  <Phone className="h-5 w-5 text-[color:var(--accent)]" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">Телефон</div>
                    <div className="font-bold">{trainer.phone}</div>
                  </div>
                </a>
              ) : null}
              {trainer.instagram ? (
                <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-[color:var(--text)]">
                  <AtSign className="h-5 w-5 text-[color:var(--accent)]" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">ВКонтакте</div>
                    <div className="font-bold">{trainer.instagram}</div>
                  </div>
                </div>
              ) : null}
              {trainer.user?.email ? (
                <a href={`mailto:${trainer.user.email}`} className="flex items-center gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-[color:var(--text)] transition hover:border-[color:var(--accent)]">
                  <Mail className="h-5 w-5 text-[color:var(--accent)]" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">Email</div>
                    <div className="font-bold">{trainer.user.email}</div>
                  </div>
                </a>
              ) : null}
              {locations.length ? (
                <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-[color:var(--text)]">
                  <MapPin className="h-5 w-5 text-[color:var(--accent)]" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">Принимает в залах</div>
                    <div className="font-bold">{locations.join(", ")}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </article>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card hover={false}>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[color:var(--accent)]">
                  <Calendar className="h-4 w-4" /> Запись к тренеру
                </div>
                <h2 className="mt-2 text-2xl font-black text-[color:var(--text)]">Выберите день и свободное время</h2>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Дни и слоты учитывают расписание тренера и выбранный зал.</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <button type="button" onClick={prevMonth} className="rounded-xl border border-[color:var(--stroke)] p-2 text-[color:var(--text)] hover:bg-[color:var(--panel)]">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-black text-[color:var(--text)]">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </span>
                  <button type="button" onClick={nextMonth} className="rounded-xl border border-[color:var(--stroke)] p-2 text-[color:var(--text)] hover:bg-[color:var(--panel)]">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-1">
                  {DAY_NAMES.map((dayName) => (
                    <div key={dayName} className="py-1 text-center text-xs font-bold text-[color:var(--muted)]">
                      {dayName}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">{calendarCells}</div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[color:var(--muted)]">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--accent)]" /> Приёмный день
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded ring-2 ring-[color:var(--accent)]/45" /> Сегодня
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 md:p-5">
                {!selectedDate ? (
                  <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                    <Calendar className="mb-4 h-10 w-10 text-[color:var(--muted)]" />
                    <h3 className="font-black text-[color:var(--text)]">Сначала выберите день</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-[color:var(--muted)]">После выбора дня здесь появятся свободные слоты и зал, где тренер принимает.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-black text-[color:var(--text)]">
                      {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                      })}
                    </h3>

                    {slotsLoading ? (
                      <p className="mt-4 text-sm text-[color:var(--muted)]">Загрузка свободного времени...</p>
                    ) : availableSlots.length === 0 ? (
                      <div className="mt-4 rounded-2xl border border-[color:var(--stroke)] p-5 text-sm text-[color:var(--muted)]">Свободных слотов на этот день больше нет.</div>
                    ) : (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={`${slot.schedule_id}-${slot.time}-${slot.location_id || "no-location"}`}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-3 text-sm font-bold transition ${
                              selectedSlot?.time === slot.time && selectedSlot?.schedule_id === slot.schedule_id && selectedSlot?.location_id === slot.location_id
                                ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                                : "border-[color:var(--stroke)] bg-[color:var(--panel)] text-[color:var(--text)] hover:border-[color:var(--accent)]"
                            }`}
                          >
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {slot.time}
                            </span>
                            {slot.location_name ? (
                              <span className="inline-flex items-center gap-1 text-xs opacity-75">
                                <MapPin className="h-3 w-3" />
                                {slot.location_name}
                              </span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedSlot ? (
                      <div className="mt-5 rounded-2xl border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/10 p-4">
                        <p className="text-sm leading-6 text-[color:var(--muted)]">
                          Вы выбрали <b className="text-[color:var(--text)]">{selectedSlot.time}</b>
                          {selectedSlot.location_name ? <> в зале <b className="text-[color:var(--text)]">{selectedSlot.location_name}</b></> : null}. Переход к оформлению произойдёт только после подтверждения.
                        </p>
                        <button type="button" onClick={goToBooking} className="mt-3 w-full rounded-xl bg-[color:var(--accent)] px-4 py-3 font-black text-white transition hover:opacity-90">
                          Записаться на выбранное время
                        </button>
                      </div>
                    ) : availableSlots.length > 0 && !slotsLoading ? (
                      <p className="mt-4 text-xs text-[color:var(--muted)]">Выбор времени ничего не оформляет автоматически. Сначала выберите слот, затем подтвердите запись.</p>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-[color:var(--text)]">Отзывы</h3>
              {trainer.reviews_count > 0 ? (
                <Badge>
                  {trainer.reviews_count} {pluralizeReviews(trainer.reviews_count)}
                </Badge>
              ) : null}
            </div>

            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[color:var(--stroke)] py-10 text-center">
                <Star className="w-10 h-10 text-[color:var(--stroke)] mx-auto mb-3" />
                <p className="text-[color:var(--muted)] text-sm">Пока нет отзывов</p>
                <p className="text-[color:var(--muted)] text-xs mt-1">Отзывы появятся после первых тренировок.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((review) => {
                  const userName = review.user?.name || review.user?.login || "Пользователь";
                  const initial = userName.trim().charAt(0).toUpperCase();

                  return (
                    <div key={review.id} className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-sm font-bold text-white">
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

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card hover={false}>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[color:var(--accent)]">
              <Dumbbell className="h-4 w-4" /> Как проходит запись
            </div>
            <div className="space-y-3 text-sm leading-6 text-[color:var(--muted)]">
              <p>Выберите рабочий день, свободное время и зал. После подтверждения откроется оформление записи.</p>
              <p>Если слот платный, система покажет демонстрационную оплату. Данные карты не сохраняются.</p>
            </div>
            <Button as={Link} href={`/booking?trainer=${trainer.id}`} variant="primary" className="mt-5 w-full">
              Открыть полную форму записи
            </Button>
          </Card>

          {schedules.length > 0 ? (
            <Card hover={false}>
              <h3 className="mb-4 text-lg font-black text-[color:var(--text)]">График и залы</h3>
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-[color:var(--text)]">{schedule.day_name}</span>
                      <span className="text-[color:var(--muted)]">{timeHHMM(schedule.start_time)} — {timeHHMM(schedule.end_time)}</span>
                    </div>
                    {schedule.location_name ? (
                      <div className="mt-2 flex items-center gap-1 text-xs text-[color:var(--muted)]">
                        <MapPin className="h-3.5 w-3.5" />
                        {schedule.location_name}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </aside>
      </div>
    </Section>
  );
}

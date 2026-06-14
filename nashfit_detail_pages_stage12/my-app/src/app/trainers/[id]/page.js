"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { apiGet } from "@/services/api";

const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function unwrap(response) {
  return response?.data ?? response ?? null;
}

function listFrom(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.services)) return response.services;
  return [];
}

function money(value) {
  const number = Number(value || 0);
  if (!number) return "по запросу";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(number);
}

function timeOf(value) {
  return String(value || "").slice(0, 5);
}

function dateIso(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function prettyDate(value) {
  try {
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(value));
  } catch {
    return value;
  }
}

function Rating({ value = 0 }) {
  const rating = Math.max(0, Math.min(5, Math.round(Number(value || 0))));
  return (
    <div className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
      {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`h-4 w-4 ${star <= rating ? "fill-current" : "text-[color:var(--stroke)]"}`} />)}
    </div>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
      <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
      <div className="mt-3 text-2xl font-black text-[color:var(--text)]">{value}</div>
      <div className="text-sm text-[color:var(--muted)]">{label}</div>
    </div>
  );
}

function ServiceCard({ service, trainerId }) {
  return (
    <Link href={`/booking?trainer_id=${trainerId}&service_id=${service.id}`} className="group rounded-[1.5rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-5 transition hover:border-emerald-500/40 hover:bg-emerald-500/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-[color:var(--text)] group-hover:text-emerald-700 dark:group-hover:text-emerald-300">{service.title || service.name || "Персональная тренировка"}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">{service.description || "Индивидуальная работа под цель клиента."}</p>
        </div>
        <Dumbbell className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-[color:var(--muted)]">
        <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> {service.duration_minutes || 60} мин</span>
        <span className="text-emerald-700 dark:text-emerald-300">{money(service.price)}</span>
      </div>
    </Link>
  );
}

export default function TrainerDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [trainer, setTrainer] = useState(null);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dateIso(0));
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [trainerRes, servicesRes] = await Promise.allSettled([
          apiGet(`/trainers/${id}`),
          apiGet(`/trainers/${id}/services`),
        ]);

        if (cancelled) return;
        if (trainerRes.status !== "fulfilled") throw trainerRes.reason;
        setTrainer(unwrap(trainerRes.value));
        setServices(servicesRes.status === "fulfilled" ? listFrom(servicesRes.value).slice(0, 6) : []);
      } catch (requestError) {
        if (!cancelled) setError(requestError?.message || "Не удалось загрузить тренера.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadSlots = useCallback(async (date) => {
    if (!id || !date) return;
    setSlotsLoading(true);
    try {
      const response = await apiGet(`/trainers/${id}/available-slots?date=${date}`);
      setSlots(Array.isArray(response?.slots) ? response.slots : listFrom(response));
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSlots(selectedDate);
  }, [selectedDate, loadSlots]);

  const nextDates = useMemo(() => Array.from({ length: 7 }).map((_, index) => dateIso(index)), []);
  const schedules = Array.isArray(trainer?.schedules) ? trainer.schedules : [];
  const photo = trainer?.photo_url || trainer?.avatar_url || null;
  const rating = Number(trainer?.avg_rating || trainer?.rating || 5);
  const location = trainer?.club?.name || trainer?.club_name || trainer?.location || "Зал НашФит";

  if (loading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg)] py-10">
        <div className="container-fitlab h-[660px] animate-pulse rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)]" />
      </main>
    );
  }

  if (!trainer) {
    return (
      <main className="min-h-screen bg-[color:var(--bg)] py-12">
        <div className="container-fitlab rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-red-700 dark:text-red-200">{error || "Тренер не найден."}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[color:var(--bg)] pb-20 pt-8">
      <div className="container-fitlab">
        <Link href="/trainers" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--muted)] transition hover:text-emerald-700 dark:hover:text-emerald-300">
          <ArrowLeft className="h-4 w-4" /> Все тренеры
        </Link>

        <section className="overflow-hidden rounded-[2.2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[420px_1fr]">
            <div className="relative min-h-[420px] border-b border-[color:var(--stroke)] bg-[color:var(--bg)] lg:border-b-0 lg:border-r">
              {photo ? <img src={photo} alt={trainer.name} className="h-full min-h-[420px] w-full object-cover" /> : <div className="grid h-full min-h-[420px] place-items-center bg-gradient-to-br from-emerald-500/16 via-cyan-500/10 to-transparent"><UserRound className="h-24 w-24 text-emerald-700/70 dark:text-emerald-300/70" /></div>}
            </div>

            <div className="relative p-6 md:p-10">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/12 blur-3xl" />
              <div className="absolute -bottom-28 left-8 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300"><Sparkles className="h-4 w-4" /> Тренер НашФит</span>
                <h1 className="mt-5 text-4xl font-black leading-tight text-[color:var(--text)] md:text-6xl">{trainer.name}</h1>
                <p className="mt-4 text-xl font-bold text-emerald-700 dark:text-emerald-300">{trainer.specialization || "Персональные тренировки"}</p>
                <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)] md:text-lg">{trainer.bio || trainer.description || "Поможет подобрать программу, поставить технику и выстроить понятный путь к результату."}</p>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-semibold text-[color:var(--muted)]">
                  <span className="inline-flex items-center gap-2"><Rating value={rating} /> {Number(rating).toFixed(1)}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> {location}</span>
                  {trainer.experience_years ? <span className="inline-flex items-center gap-1"><Award className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> {trainer.experience_years} лет опыта</span> : null}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <Stat icon={Award} value={trainer.experience_years || 3} label="лет опыта" />
                  <Stat icon={Star} value={Number(rating).toFixed(1)} label="рейтинг" />
                  <Stat icon={CalendarDays} value={slots.length || "—"} label="слотов сегодня" />
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={`/booking?trainer_id=${id}`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 font-black text-white transition hover:bg-emerald-600"><CalendarDays className="h-5 w-5" /> Записаться</Link>
                  {trainer.phone ? <a href={`tel:${trainer.phone}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-5 py-3.5 font-bold text-[color:var(--text)] transition hover:border-emerald-500/40"><Phone className="h-5 w-5" /> Позвонить</a> : null}
                  {trainer.email ? <a href={`mailto:${trainer.email}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-5 py-3.5 font-bold text-[color:var(--text)] transition hover:border-emerald-500/40"><Mail className="h-5 w-5" /> Email</a> : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_390px]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[color:var(--text)]">Услуги тренера</h2>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">Выбери формат и переходи к записи</p>
                </div>
                <Dumbbell className="h-8 w-8 text-emerald-700 dark:text-emerald-300" />
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {services.length ? services.map((service) => <ServiceCard key={service.id} service={service} trainerId={id} />) : (
                  ["Персональная тренировка", "Консультация по программе"].map((name, index) => <ServiceCard key={name} trainerId={id} service={{ id: index + 1, name, duration_minutes: index ? 30 : 60, price: index ? 1000 : 2500, description: index ? "Разбор цели, нагрузки и плана тренировок." : "Полноценная тренировка с техникой и контролем нагрузки." }} />)
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
              <h2 className="text-2xl font-black text-[color:var(--text)]">Расписание</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">Рабочие дни и стандартные часы тренера</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {schedules.length ? schedules.map((schedule) => (
                  <div key={schedule.id || `${schedule.day_of_week}-${schedule.start_time}`} className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                    <div className="font-black text-[color:var(--text)]">{DAYS[Number(schedule.day_of_week)] || "День"}</div>
                    <div className="mt-1 text-sm text-[color:var(--muted)]">{timeOf(schedule.start_time)} — {timeOf(schedule.end_time)}</div>
                  </div>
                )) : <div className="rounded-2xl border border-dashed border-[color:var(--stroke)] bg-[color:var(--bg)] p-5 text-sm text-[color:var(--muted)] sm:col-span-2 lg:col-span-3">Расписание появится после настройки тренером или администратором.</div>}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
              <h2 className="text-2xl font-black text-[color:var(--text)]">Почему с этим тренером удобно</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {["Понятный план под цель", "Контроль техники", "Связь с программами сайта", "Запись без звонков"].map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl bg-[color:var(--bg)] p-4 font-bold text-[color:var(--text)]"><CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" /> {item}</div>)}
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-7">
              <h2 className="text-2xl font-black text-[color:var(--text)]">Ближайшие слоты</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">Выбери день и переходи к бронированию</p>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {nextDates.map((date) => (
                  <button key={date} type="button" onClick={() => setSelectedDate(date)} className={`rounded-2xl border px-2 py-3 text-center transition ${selectedDate === date ? "border-emerald-500 bg-emerald-500 text-white" : "border-[color:var(--stroke)] bg-[color:var(--bg)] text-[color:var(--text)] hover:border-emerald-500/40"}`}>
                    <div className="text-xs font-bold opacity-80">{DAYS[new Date(date).getDay()]}</div>
                    <div className="text-sm font-black">{new Date(date).getDate()}</div>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                <div className="font-black text-[color:var(--text)]">{prettyDate(selectedDate)}</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {slotsLoading ? <div className="col-span-2 py-4 text-sm text-[color:var(--muted)]">Загрузка слотов...</div> : slots.length ? slots.slice(0, 8).map((slot, index) => {
                    const time = typeof slot === "string" ? slot : slot.time || slot.start_time || slot.label;
                    return <Link key={`${time}-${index}`} href={`/booking?trainer_id=${id}&date=${selectedDate}&time=${encodeURIComponent(time || "")}`} className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2 text-center text-sm font-black text-[color:var(--text)] transition hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300">{timeOf(time) || "Свободно"}</Link>;
                  }) : <div className="col-span-2 rounded-xl border border-dashed border-[color:var(--stroke)] p-4 text-sm text-[color:var(--muted)]">На выбранный день свободных слотов нет.</div>}
                </div>
              </div>

              <Link href={`/booking?trainer_id=${id}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 font-black text-white transition hover:bg-emerald-600"><CalendarDays className="h-5 w-5" /> Открыть запись</Link>
            </div>

            <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6">
              <h2 className="text-xl font-black text-[color:var(--text)]">Контакты и зал</h2>
              <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-emerald-700 dark:text-emerald-300" /> {location}</div>
                {trainer.phone ? <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-emerald-700 dark:text-emerald-300" /> {trainer.phone}</div> : null}
                {trainer.email ? <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-emerald-700 dark:text-emerald-300" /> {trainer.email}</div> : null}
                {trainer.vk_url ? <a href={trainer.vk_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300"><MessageCircle className="h-5 w-5" /> ВКонтакте</a> : null}
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-500/25 bg-emerald-500/10 p-6">
              <div className="flex items-start gap-3"><ShieldCheck className="h-6 w-6 shrink-0 text-emerald-700 dark:text-emerald-300" /><div><div className="font-black text-[color:var(--text)]">Безопасная запись</div><p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">Запись создаётся через сайт, а пользователь видит её в личном кабинете.</p></div></div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

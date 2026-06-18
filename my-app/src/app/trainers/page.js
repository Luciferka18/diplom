"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/services/api";
import Link from "next/link";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Calendar, Clock, Loader2, MapPin, Star } from "lucide-react";

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/ё/g, "е")
    .replace(/й/g, "и")
    .replace(/[^a-zа-я0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const trainerImagePool = [
  "/seed-images/trainers/anna-kuznetsova.webp",
  "/seed-images/trainers/dmitry-silnov.webp",
  "/seed-images/trainers/sofia-morozova.webp",
  "/seed-images/trainers/pavel-orlov.webp",
  "/seed-images/trainers/alina-vetrova.webp",
  "/seed-images/trainers/roman-belov.webp",
  "/seed-images/trainers/maksim-kozlov.webp",
  "/seed-images/trainers/andrey-sokolov.webp",
  "/seed-images/trainers/ksenia-romanova.webp",
  "/seed-images/trainers/igor-ustinov.webp",
];

const trainerImageByName = {
  "anna-kuznetsova": "/seed-images/trainers/anna-kuznetsova.webp",
  "dmitry-silnov": "/seed-images/trainers/dmitry-silnov.webp",
  "sofia-morozova": "/seed-images/trainers/sofia-morozova.webp",
  "pavel-orlov": "/seed-images/trainers/pavel-orlov.webp",
  "alina-vetrova": "/seed-images/trainers/alina-vetrova.webp",
  "roman-belov": "/seed-images/trainers/roman-belov.webp",
  "maksim-kozlov": "/seed-images/trainers/maksim-kozlov.webp",
  "andrey-sokolov": "/seed-images/trainers/andrey-sokolov.webp",
  "ksenia-romanova": "/seed-images/trainers/ksenia-romanova.webp",
  "igor-ustinov": "/seed-images/trainers/igor-ustinov.webp",
  "elena-fitnessova": "/seed-images/trainers/elena-fitnessova.webp",

  "анна-кузнецова": "/seed-images/trainers/anna-kuznetsova.webp",
  "дмитрии-сильнов": "/seed-images/trainers/dmitry-silnov.webp",
  "дмитрий-сильнов": "/seed-images/trainers/dmitry-silnov.webp",
  "софия-морозова": "/seed-images/trainers/sofia-morozova.webp",
  "павел-орлов": "/seed-images/trainers/pavel-orlov.webp",
  "алина-ветрова": "/seed-images/trainers/alina-vetrova.webp",
  "роман-белов": "/seed-images/trainers/roman-belov.webp",
  "максим-козлов": "/seed-images/trainers/maksim-kozlov.webp",
  "андреи-соколов": "/seed-images/trainers/andrey-sokolov.webp",
  "андрей-соколов": "/seed-images/trainers/andrey-sokolov.webp",
  "ксения-романова": "/seed-images/trainers/ksenia-romanova.webp",
  "игорь-устинов": "/seed-images/trainers/igor-ustinov.webp",
  "елена-фитнесова": "/seed-images/trainers/elena-fitnessova.webp",

  "алиса-корнеева": "/seed-images/trainers/alina-vetrova.webp",
  "анна-волкова": "/seed-images/trainers/anna-kuznetsova.webp",
  "павел-денисов": "/seed-images/trainers/pavel-orlov.webp",
  "роман-шаталов": "/seed-images/trainers/roman-belov.webp",
  "илья-ковалев": "/seed-images/trainers/dmitry-silnov.webp",
  "илья-ковалёв": "/seed-images/trainers/dmitry-silnov.webp",
};

const demoScheduleTemplates = [
  [
    { day_name: "Понедельник", day_of_week: 1, start_time: "09:00", end_time: "18:00", location_name: "НашФит Центр" },
    { day_name: "Среда", day_of_week: 3, start_time: "09:00", end_time: "18:00", location_name: "НашФит Центр" },
    { day_name: "Пятница", day_of_week: 5, start_time: "10:00", end_time: "19:00", location_name: "НашФит Север" },
  ],
  [
    { day_name: "Вторник", day_of_week: 2, start_time: "08:00", end_time: "17:00", location_name: "НашФит Север" },
    { day_name: "Четверг", day_of_week: 4, start_time: "08:00", end_time: "17:00", location_name: "НашФит Север" },
    { day_name: "Суббота", day_of_week: 6, start_time: "10:00", end_time: "16:00", location_name: "НашФит Центр" },
  ],
  [
    { day_name: "Понедельник", day_of_week: 1, start_time: "12:00", end_time: "20:00", location_name: "НашФит Riverside" },
    { day_name: "Четверг", day_of_week: 4, start_time: "12:00", end_time: "20:00", location_name: "НашФит Riverside" },
    { day_name: "Воскресенье", day_of_week: 7, start_time: "09:00", end_time: "14:00", location_name: "НашФит Центр" },
  ],
  [
    { day_name: "Вторник", day_of_week: 2, start_time: "10:00", end_time: "19:00", location_name: "НашФит Центр" },
    { day_name: "Среда", day_of_week: 3, start_time: "10:00", end_time: "19:00", location_name: "НашФит Север" },
    { day_name: "Пятница", day_of_week: 5, start_time: "09:00", end_time: "15:00", location_name: "НашФит Riverside" },
  ],
];

function isBadImagePath(value) {
  const path = String(value || "").toLowerCase();

  if (!path) return true;

  return (
    path.includes("/demo/") ||
    path.includes("placeholder") ||
    path.includes("gradient") ||
    path.includes("avatar.svg") ||
    path.endsWith(".svg")
  );
}

function trainerImage(trainer, indexOrId = 0) {
  const keys = [trainer?.slug, trainer?.name, trainer?.login, trainer?.id, indexOrId]
    .map(normalizeKey)
    .filter(Boolean);

  for (const key of keys) {
    if (trainerImageByName[key]) return trainerImageByName[key];
  }

  const explicit = trainer?.photo_url || trainer?.image_url || trainer?.avatar_url || trainer?.user?.avatar_url;
  if (!isBadImagePath(explicit)) return explicit;

  const stableIndex = Number.isFinite(Number(indexOrId)) ? Number(indexOrId) : Number(trainer?.id || 0);
  return trainerImagePool[Math.abs(stableIndex) % trainerImagePool.length];
}

function schedulesForTrainer(trainer, index = 0) {
  const list = Array.isArray(trainer?.schedules) ? trainer.schedules.filter(Boolean) : [];

  if (list.length > 0) {
    return list;
  }

  const stableIndex = Number.isFinite(Number(trainer?.id)) ? Number(trainer.id) : index;
  return demoScheduleTemplates[Math.abs(stableIndex + index) % demoScheduleTemplates.length];
}

function normalizeList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.data)) return response.data.data;
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
            star <= v ? "fill-yellow-400 text-[color:var(--warning)]" : "text-[color:var(--stroke)]"
          }`}
        />
      ))}
    </div>
  );
}

function formatTime(value) {
  return String(value || "").slice(0, 5);
}

function schedulePreview(trainer, index = 0) {
  const list = schedulesForTrainer(trainer, index);

  return (
    <div className="space-y-2">
      {list.slice(0, 3).map((schedule, scheduleIndex) => (
        <div
          key={schedule.id || `${schedule.day_of_week}-${schedule.start_time}-${scheduleIndex}`}
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

          <div className="mt-1 flex items-center gap-1 text-[color:var(--muted)]">
            <MapPin className="h-3.5 w-3.5" />
            {schedule.location_name || "НашФит Центр"}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrainerCard({ trainer, index }) {
  return (
    <li>
      <Card className="h-full flex flex-col" hover={false}>
        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)]">
          <img
            src={trainerImage(trainer, index)}
            alt={trainer.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = trainerImagePool[index % trainerImagePool.length];
            }}
          />
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

          {Number(trainer.reviews_count || 0) > 0 ? (
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
            {schedulePreview(trainer, index)}
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
  );
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTrainers() {
      setLoading(true);
      setErrorText("");

      try {
        const response = await apiGet("/trainers");
        if (active) setTrainers(normalizeList(response));
      } catch (error) {
        console.error("[trainers] failed to load list", error);
        if (active) {
          setTrainers([]);
          setErrorText("Не удалось загрузить тренеров. Проверьте, что Laravel API запущен.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTrainers();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Section
      title="Наши тренеры"
      subtitle="Выбери тренера, посмотри расписание и запишись на удобное время"
    >
      {loading ? (
        <Card hover={false} className="flex items-center justify-center gap-3 py-12">
          <Loader2 className="h-5 w-5 animate-spin text-[color:var(--accent)]" />
          <span className="text-[color:var(--muted)]">Загрузка тренеров...</span>
        </Card>
      ) : errorText ? (
        <Card hover={false} className="text-[color:var(--danger)]">
          {errorText}
        </Card>
      ) : trainers.length === 0 ? (
        <Card hover={false}>Тренеры не найдены</Card>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trainers.map((trainer, index) => (
            <TrainerCard key={trainer.id || `${trainer.name}-${index}`} trainer={trainer} index={index} />
          ))}
        </ul>
      )}
    </Section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/services/api";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Loader2,
  PlayCircle,
  Target,
} from "lucide-react";

const levelNames = {
  beginner: "Начальный",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

function normalizePrograms(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}


export default function ProgramsPage() {
  const { isAuthed, loading: authLoading } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [progressItems, setProgressItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPrograms() {
      setLoading(true);
      setError("");

      try {
        const response = await apiGet("/programs?per_page=100");
        if (!cancelled) setPrograms(normalizePrograms(response));
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.data?.message ||
              requestError?.message ||
              "Не удалось загрузить программы."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPrograms();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthed) {
      if (!isAuthed) setProgressItems([]);
      return;
    }

    let cancelled = false;

    apiGet("/account/programs")
      .then((response) => {
        if (!cancelled) {
          setProgressItems(Array.isArray(response?.data) ? response.data : []);
        }
      })
      .catch(() => {
        if (!cancelled) setProgressItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthed]);

  const progressByProgram = useMemo(() => {
    return new Map(
      progressItems.map((item) => [String(item?.program?.id), item])
    );
  }, [progressItems]);

  return (
    <Section
      title="Программы тренировок"
      subtitle="Все программы бесплатны. Выберите подходящий план, начните прохождение и отмечайте выполненные недели — прогресс сохранится в профиле."
    >
      {loading ? (
        <Card hover={false} className="flex items-center justify-center gap-3 py-14">
          <Loader2 className="h-5 w-5 animate-spin text-[color:var(--accent)]" />
          <span className="text-[color:var(--muted)]">Загрузка программ...</span>
        </Card>
      ) : error ? (
        <Card hover={false} className="border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] bg-[color:var(--danger-soft)] text-[color:var(--danger)]">
          {error}
        </Card>
      ) : programs.length === 0 ? (
        <Card hover={false}>Программы пока не добавлены.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((program) => {
            const progress = progressByProgram.get(String(program.id));
            const percent = Number(progress?.progress_percent || 0);

            return (
              <Link key={program.id} href={`/programs/${program.id}`} className="group">
                <Card className="flex h-full flex-col overflow-hidden p-0">
                  <div className="flex min-h-36 items-center justify-center bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent p-6">
                    <Dumbbell className="h-14 w-14 text-[color:var(--accent)]/80 transition-transform group-hover:scale-110" />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{levelNames[program.level] || program.level || "Любой уровень"}</Badge>
                      <Badge className="border-[color:var(--accent-border)] bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
                        Бесплатно
                      </Badge>
                      {progress?.status === "completed" ? (
                        <Badge className="border-[color:var(--accent-border)] bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Завершена
                        </Badge>
                      ) : progress ? (
                        <Badge className="border-cyan-500/30 bg-cyan-500/15 text-[color:var(--secondary)]">
                          <PlayCircle className="mr-1 h-3.5 w-3.5" /> В процессе
                        </Badge>
                      ) : null}
                    </div>

                    <h2 className="mt-4 text-xl font-bold text-[color:var(--text)]">
                      {program.title || program.name}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm text-[color:var(--muted)]">
                      {program.description || "Описание скоро появится."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-[color:var(--muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4" />
                        {program.duration_weeks || 1} нед.
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Target className="h-4 w-4" />
                        {program.workouts_count || 0} тренировок
                      </span>
                    </div>

                    {progress ? (
                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-[color:var(--muted)]">
                            {progress.completed_weeks} из {progress.total_weeks} недель
                          </span>
                          <span className="font-semibold text-[color:var(--accent)]">{percent}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[color:var(--bg)]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-auto flex items-center justify-between pt-6">
                      <span className="font-semibold text-[color:var(--accent)]">
                        Бесплатно
                      </span>
                      <span className="inline-flex items-center gap-2 font-semibold text-[color:var(--accent)]">
                        {progress ? "Продолжить" : "Подробнее"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </Section>
  );
}

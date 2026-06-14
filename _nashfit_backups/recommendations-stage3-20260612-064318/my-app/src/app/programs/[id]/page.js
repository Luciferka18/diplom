"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Target,
  Trash2,
  UserRound,
} from "lucide-react";

const levelNames = {
  beginner: "Начальный",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

const statusNames = {
  active: "В процессе",
  paused: "На паузе",
  completed: "Завершена",
};

function unwrap(response) {
  return response?.data ?? response ?? null;
}


export default function ProgramPage() {
  const params = useParams();
  const id = params?.id;
  const { isAuthed, loading: authLoading } = useAuth();

  const [program, setProgram] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedPlanWeek, setSelectedPlanWeek] = useState(1);

  const loadProgress = useCallback(async () => {
    if (!id || !isAuthed) {
      setProgress(null);
      return;
    }

    setProgressLoading(true);
    try {
      const response = await apiGet(`/programs/${id}/progress`);
      setProgress(response?.progress ?? null);
    } catch (requestError) {
      if (requestError?.status !== 404) {
        setError(requestError?.message || "Не удалось загрузить прогресс.");
      }
    } finally {
      setProgressLoading(false);
    }
  }, [id, isAuthed]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadProgram() {
      setLoading(true);
      setError("");
      try {
        const response = await apiGet(`/programs/${id}`);
        if (!cancelled) setProgram(unwrap(response));
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.status === 404
              ? "Программа не найдена."
              : requestError?.message || "Не удалось загрузить программу."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProgram();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!authLoading) loadProgress();
  }, [authLoading, loadProgress]);

  const totalWeeks = useMemo(
    () => Math.max(1, Number(progress?.total_weeks || program?.duration_weeks || 1)),
    [progress?.total_weeks, program?.duration_weeks]
  );

  const workouts = useMemo(
    () => (Array.isArray(program?.workouts) ? program.workouts : []),
    [program?.workouts]
  );

  const workoutsByWeek = useMemo(() => {
    const grouped = new Map();

    workouts.forEach((workout, index) => {
      const week = Math.max(1, Number(workout.week_number || Math.floor(index / 3) + 1));
      const current = grouped.get(week) || [];
      current.push(workout);
      grouped.set(week, current);
    });

    grouped.forEach((items) => {
      items.sort((a, b) => Number(a.day_number || 0) - Number(b.day_number || 0));
    });

    return grouped;
  }, [workouts]);

  useEffect(() => {
    const nextWeek = Number(progress?.current_week || 1);
    setSelectedPlanWeek(Math.min(Math.max(nextWeek, 1), totalWeeks));
  }, [progress?.current_week, totalWeeks]);

  async function startProgram() {
    setActionLoading("start");
    setError("");
    setNotice("");
    try {
      const response = await apiPost(`/programs/${id}/progress/start`, {});
      setProgress(response?.progress ?? null);
      setNotice("Программа добавлена в личный кабинет.");
    } catch (requestError) {
      setError(requestError?.message || "Не удалось начать программу.");
    } finally {
      setActionLoading("");
    }
  }

  async function updateProgress(action) {
    setActionLoading(action);
    setError("");
    setNotice("");
    try {
      const response = await apiPatch(`/programs/${id}/progress`, { action });
      setProgress(response?.progress ?? null);
      setNotice(response?.message || "Прогресс обновлён.");
    } catch (requestError) {
      setError(requestError?.message || "Не удалось обновить прогресс.");
    } finally {
      setActionLoading("");
    }
  }

  async function removeProgram() {
    if (!window.confirm("Удалить программу и весь сохранённый прогресс из профиля?")) return;

    setActionLoading("remove");
    setError("");
    try {
      await apiDelete(`/programs/${id}/progress`);
      setProgress(null);
      setNotice("Программа удалена из личного кабинета.");
    } catch (requestError) {
      setError(requestError?.message || "Не удалось удалить программу.");
    } finally {
      setActionLoading("");
    }
  }

  if (loading) {
    return (
      <Container className="flex min-h-[55vh] items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </Container>
    );
  }

  if (error && !program) {
    return (
      <Container className="py-12">
        <Card hover={false} className="border-red-500/30 bg-red-500/10 text-red-300">
          {error}
        </Card>
      </Container>
    );
  }

  if (!program) return null;

  const percent = Number(progress?.progress_percent || 0);
  const selectedWorkouts = workoutsByWeek.get(selectedPlanWeek) || [];

  return (
    <Container className="py-8 md:py-12">
      <Link
        href="/programs"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-emerald-400"
      >
        <ArrowLeft className="h-4 w-4" /> Все программы
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card hover={false} className="overflow-hidden p-0">
            <div className="bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{levelNames[program.level] || program.level || "Любой уровень"}</Badge>
                {progress ? (
                  <Badge
                    className={
                      progress.status === "completed"
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                        : progress.status === "paused"
                          ? "border-yellow-500/30 bg-yellow-500/15 text-yellow-300"
                          : "border-cyan-500/30 bg-cyan-500/15 text-cyan-300"
                    }
                  >
                    {statusNames[progress.status] || progress.status}
                  </Badge>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-bold text-[color:var(--text)] md:text-4xl">
                {program.title || program.name}
              </h1>
              <p className="mt-4 max-w-3xl leading-relaxed text-[color:var(--muted)]">
                {program.description || "Описание программы скоро появится."}
              </p>

              <div className="mt-6 flex flex-wrap gap-5 text-sm text-[color:var(--muted)]">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-emerald-400" />
                  {program.duration_weeks || 1} недель
                </span>
                <span className="inline-flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-emerald-400" />
                  {workouts.length} тренировок
                </span>
                {program.trainer?.name ? (
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-emerald-400" />
                    {program.trainer.name}
                  </span>
                ) : null}
              </div>
            </div>
          </Card>

          {progress ? (
            <Card hover={false} className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">
                    Ваш прогресс
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-[color:var(--text)]">
                    {progress.status === "completed"
                      ? "Программа завершена"
                      : `Неделя ${progress.current_week} из ${progress.total_weeks}`}
                  </h2>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    Выполнено недель: {progress.completed_weeks}. Все изменения сразу отображаются в профиле.
                  </p>
                </div>
                <div className="text-3xl font-bold text-emerald-400">{percent}%</div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[color:var(--bg)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                {Array.from({ length: totalWeeks }, (_, index) => {
                  const week = index + 1;
                  const completed = week <= Number(progress.completed_weeks || 0);
                  const current = week === Number(progress.current_week || 1) && progress.status !== "completed";

                  return (
                    <div
                      key={week}
                      className={`flex h-12 items-center justify-center rounded-xl border text-sm font-semibold ${
                        completed
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                          : current
                            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                            : "border-[color:var(--stroke)] text-[color:var(--muted)]"
                      }`}
                      title={`Неделя ${week}`}
                    >
                      {completed ? <Check className="h-4 w-4" /> : week}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {progress.status === "completed" ? (
                  <Button onClick={() => updateProgress("restart")} disabled={!!actionLoading}>
                    {actionLoading === "restart" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                    Пройти заново
                  </Button>
                ) : progress.status === "paused" ? (
                  <Button onClick={() => updateProgress("resume")} disabled={!!actionLoading}>
                    {actionLoading === "resume" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Продолжить
                  </Button>
                ) : (
                  <Button onClick={() => updateProgress("advance")} disabled={!!actionLoading}>
                    {actionLoading === "advance" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Отметить неделю выполненной
                  </Button>
                )}

                {progress.completed_weeks > 0 && progress.status !== "completed" ? (
                  <Button variant="outline" onClick={() => updateProgress("rollback")} disabled={!!actionLoading}>
                    <ChevronLeft className="h-4 w-4" /> Вернуть неделю
                  </Button>
                ) : null}

                {progress.status === "active" ? (
                  <Button variant="outline" onClick={() => updateProgress("pause")} disabled={!!actionLoading}>
                    <Pause className="h-4 w-4" /> Поставить на паузу
                  </Button>
                ) : null}

                <Button variant="ghost" onClick={removeProgram} disabled={!!actionLoading} className="text-red-400 hover:text-red-300">
                  {actionLoading === "remove" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Удалить из профиля
                </Button>
              </div>
            </Card>
          ) : null}

          <Card hover={false} className="p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-emerald-400" />
                <div>
                  <h2 className="text-xl font-bold text-[color:var(--text)]">План программы</h2>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    {totalWeeks} недель · 3 тренировки в неделю · доступ бесплатно
                  </p>
                </div>
              </div>
              <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-300">
                {workouts.length} тренировок
              </Badge>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: totalWeeks }, (_, index) => {
                const week = index + 1;
                const active = week === selectedPlanWeek;
                const completed = week <= Number(progress?.completed_weeks || 0);

                return (
                  <button
                    key={week}
                    type="button"
                    onClick={() => setSelectedPlanWeek(week)}
                    className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                        : completed
                          ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400"
                          : "border-[color:var(--stroke)] text-[color:var(--muted)] hover:border-emerald-500/40 hover:text-[color:var(--text)]"
                    }`}
                  >
                    Неделя {week}
                  </button>
                );
              })}
            </div>

            {selectedWorkouts.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {selectedWorkouts.map((workout, index) => (
                  <div
                    key={workout.id}
                    className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)]/40 p-4 md:p-5"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 font-bold text-emerald-400">
                        {workout.day_number || index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="font-semibold text-[color:var(--text)]">{workout.title}</h3>
                          {workout.duration_minutes ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--muted)]">
                              <Clock3 className="h-3.5 w-3.5 text-emerald-400" />
                              {workout.duration_minutes} минут
                            </span>
                          ) : null}
                        </div>
                        {workout.description ? (
                          <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">{workout.description}</p>
                        ) : null}
                        {workout.video_url ? (
                          <a
                            href={workout.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300"
                          >
                            Смотреть видео <ChevronRight className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-[color:var(--stroke)] p-6 text-center text-sm text-[color:var(--muted)]">
                План этой недели формируется. Обновите страницу после применения миграции.
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card hover={false} className="p-6">
            <p className="text-sm text-[color:var(--muted)]">Доступ к программе</p>
            <p className="mt-1 text-3xl font-bold text-emerald-400">Бесплатно</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Все тренировки и отслеживание прогресса доступны после входа.</p>

            <div className="mt-5 space-y-3 text-sm text-[color:var(--muted)]">
              <div className="flex items-center justify-between gap-3">
                <span>Длительность</span>
                <span className="font-semibold text-[color:var(--text)]">{program.duration_weeks || 1} нед.</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Уровень</span>
                <span className="font-semibold text-[color:var(--text)]">{levelNames[program.level] || program.level || "Любой"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Тренер</span>
                <span className="text-right font-semibold text-[color:var(--text)]">{program.trainer?.name || "Команда НашФит"}</span>
              </div>
            </div>

            <div className="mt-6">
              {authLoading || progressLoading ? (
                <Button className="w-full" disabled>
                  <Loader2 className="h-4 w-4 animate-spin" /> Загрузка...
                </Button>
              ) : !isAuthed ? (
                <Button as={Link} href={`/login?next=${encodeURIComponent(`/programs/${id}`)}`} className="w-full">
                  Войти и начать
                </Button>
              ) : !progress ? (
                <Button onClick={startProgram} className="w-full" disabled={!!actionLoading}>
                  {actionLoading === "start" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Начать программу
                </Button>
              ) : (
                <Button as={Link} href="/account/programs" variant="outline" className="w-full">
                  Открыть мои программы
                </Button>
              )}
            </div>
          </Card>

          {notice ? (
            <Card hover={false} className="border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {notice}
            </Card>
          ) : null}

          {error ? (
            <Card hover={false} className="border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </Card>
          ) : null}
        </aside>
      </div>
    </Container>
  );
}

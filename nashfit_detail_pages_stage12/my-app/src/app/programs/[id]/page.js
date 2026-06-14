"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Loader2,
  PackageSearch,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  UserRound,
} from "lucide-react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const levelLabels = {
  beginner: "Начальный",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

const statusLabels = {
  active: "В процессе",
  paused: "На паузе",
  completed: "Завершена",
};

function unwrap(response) {
  return response?.data ?? response ?? null;
}

function listFrom(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function money(value) {
  const number = Number(value || 0);
  if (!number) return null;
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(number);
}

function imageOf(item) {
  return item?.image_url || item?.cover_image_url || item?.photo_url || item?.gallery?.[0] || null;
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
      <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
      <div className="mt-3 text-2xl font-black text-[color:var(--text)]">{value}</div>
      <div className="text-sm text-[color:var(--muted)]">{label}</div>
    </div>
  );
}

function RelatedMiniCard({ item, type }) {
  const href = type === "article" ? `/articles/${item.id}` : `/shop/${item.id}`;
  const Icon = type === "article" ? BookOpen : PackageSearch;
  const image = imageOf(item);

  return (
    <Link href={href} className="group rounded-[1.5rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3 transition hover:-translate-y-0.5 hover:border-emerald-500/35 hover:shadow-xl hover:shadow-emerald-950/10">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[color:var(--bg)]">
        {image ? <img src={image} alt={item.title || item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full w-full place-items-center"><Icon className="h-8 w-8 text-emerald-700 dark:text-emerald-300" /></div>}
      </div>
      <div className="mt-3 line-clamp-2 font-black text-[color:var(--text)] group-hover:text-emerald-700 dark:group-hover:text-emerald-300">{item.title || item.name}</div>
      <div className="mt-1 text-sm text-[color:var(--muted)]">{type === "article" ? `${item.reading_time_minutes || 3} мин чтения` : money(item.price) || "Товар"}</div>
    </Link>
  );
}

export default function ProgramDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { isAuthed, loading: authLoading } = useAuth();
  const [program, setProgram] = useState(null);
  const [progress, setProgress] = useState(null);
  const [products, setProducts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [programRes, productsRes, articlesRes] = await Promise.allSettled([
          apiGet(`/programs/${id}`),
          apiGet("/products?per_page=8"),
          apiGet("/articles?per_page=8"),
        ]);

        if (cancelled) return;
        if (programRes.status !== "fulfilled") throw programRes.reason;
        const loaded = unwrap(programRes.value);
        setProgram(loaded);
        setProducts(productsRes.status === "fulfilled" ? listFrom(productsRes.value).slice(0, 4) : []);
        setArticles(articlesRes.status === "fulfilled" ? listFrom(articlesRes.value).slice(0, 4) : []);
      } catch (requestError) {
        if (!cancelled) setError(requestError?.message || "Не удалось загрузить программу.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id || authLoading || !isAuthed) return;
    let cancelled = false;

    async function loadProgress() {
      setProgressLoading(true);
      try {
        const response = await apiGet(`/programs/${id}/progress`);
        if (!cancelled) setProgress(response?.progress ?? null);
      } catch (requestError) {
        if (!cancelled && requestError?.status !== 404) setError(requestError?.message || "Не удалось загрузить прогресс.");
      } finally {
        if (!cancelled) setProgressLoading(false);
      }
    }

    loadProgress();
    return () => {
      cancelled = true;
    };
  }, [id, isAuthed, authLoading]);

  const workouts = useMemo(() => Array.isArray(program?.workouts) ? program.workouts : [], [program]);
  const totalWeeks = Math.max(1, Number(progress?.total_weeks || program?.duration_weeks || 1));
  const percent = Math.max(0, Math.min(100, Number(progress?.progress_percent || 0)));
  const heroImage = imageOf(program);

  const workoutsByWeek = useMemo(() => {
    const map = new Map();
    workouts.forEach((workout, index) => {
      const week = Math.max(1, Number(workout.week_number || Math.floor(index / 3) + 1));
      const rows = map.get(week) || [];
      rows.push(workout);
      map.set(week, rows);
    });
    map.forEach((rows) => rows.sort((a, b) => Number(a.day_number || 0) - Number(b.day_number || 0)));
    return map;
  }, [workouts]);

  useEffect(() => {
    const currentWeek = Math.max(1, Number(progress?.current_week || 1));
    setSelectedWeek(Math.min(currentWeek, totalWeeks));
  }, [progress?.current_week, totalWeeks]);

  async function startProgram() {
    if (!isAuthed) {
      window.location.href = `/login?next=/programs/${id}`;
      return;
    }

    setActionLoading("start");
    setNotice("");
    setError("");
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
    setNotice("");
    setError("");
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

  async function removeProgress() {
    if (!window.confirm("Удалить программу из личного кабинета?")) return;
    setActionLoading("remove");
    setNotice("");
    setError("");
    try {
      await apiDelete(`/programs/${id}/progress`);
      setProgress(null);
      setNotice("Программа удалена из личного кабинета.");
    } catch (requestError) {
      setError(requestError?.message || "Не удалось удалить прогресс.");
    } finally {
      setActionLoading("");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg)] py-10">
        <div className="container-fitlab h-[620px] animate-pulse rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)]" />
      </main>
    );
  }

  if (!program) {
    return (
      <main className="min-h-screen bg-[color:var(--bg)] py-12">
        <div className="container-fitlab rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-red-700 dark:text-red-200">{error || "Программа не найдена."}</div>
      </main>
    );
  }

  const selectedWorkouts = workoutsByWeek.get(selectedWeek) || [];

  return (
    <main className="min-h-screen bg-[color:var(--bg)] pb-20 pt-8">
      <div className="container-fitlab">
        <Link href="/programs" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--muted)] transition hover:text-emerald-700 dark:hover:text-emerald-300">
          <ArrowLeft className="h-4 w-4" /> Все программы
        </Link>

        <section className="overflow-hidden rounded-[2.2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1fr_420px]">
            <div className="relative p-6 md:p-10">
              <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/12 blur-3xl" />
              <div className="absolute -bottom-28 right-4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">{levelLabels[program.level] || program.level || "Любой уровень"}</span>
                  {progress ? <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-700 dark:text-cyan-300">{statusLabels[progress.status] || progress.status}</span> : null}
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-[color:var(--text)] md:text-6xl">{program.title || program.name}</h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)] md:text-lg">{program.description || "Программа тренировок с понятным планом, прогрессом и рекомендациями."}</p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <Stat icon={CalendarDays} label="длительность" value={`${totalWeeks} нед.`} />
                  <Stat icon={Dumbbell} label="тренировок" value={workouts.length || program.workouts_count || 0} />
                  <Stat icon={Target} label="цель" value={program.goal || "форма"} />
                </div>
              </div>
            </div>

            <div className="relative min-h-[360px] border-t border-[color:var(--stroke)] bg-[color:var(--bg)] lg:border-l lg:border-t-0">
              {heroImage ? <img src={heroImage} alt={program.title || program.name} className="h-full min-h-[360px] w-full object-cover" /> : <div className="grid h-full min-h-[360px] place-items-center bg-gradient-to-br from-emerald-500/16 via-cyan-500/10 to-transparent"><Dumbbell className="h-24 w-24 text-emerald-700/70 dark:text-emerald-300/70" /></div>}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[color:var(--text)]">План по неделям</h2>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">Выбери неделю и посмотри тренировки</p>
                </div>
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                  {Array.from({ length: totalWeeks }).map((_, index) => {
                    const week = index + 1;
                    return (
                      <button key={week} type="button" onClick={() => setSelectedWeek(week)} className={`h-11 min-w-11 rounded-2xl border px-4 text-sm font-black transition ${selectedWeek === week ? "border-emerald-500 bg-emerald-500 text-white" : "border-[color:var(--stroke)] bg-[color:var(--bg)] text-[color:var(--text)] hover:border-emerald-500/40"}`}>{week}</button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {selectedWorkouts.length ? selectedWorkouts.map((workout, index) => (
                  <div key={workout.id || index} className="rounded-[1.5rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">День {workout.day_number || index + 1}</div>
                        <h3 className="mt-1 text-xl font-black text-[color:var(--text)]">{workout.title || workout.name || "Тренировка"}</h3>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-700 dark:text-emerald-300"><Clock3 className="h-4 w-4" /> {workout.duration_minutes || workout.duration || 45} мин</div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{workout.description || "Выполни разминку, основную часть и спокойную заминку. Следи за техникой."}</p>
                  </div>
                )) : <div className="rounded-[1.5rem] border border-dashed border-[color:var(--stroke)] bg-[color:var(--bg)] p-6 text-sm text-[color:var(--muted)]">Для этой недели план пока не заполнен.</div>}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300"><Sparkles className="h-4 w-4" /> Что прокачиваем</div>
              <h2 className="mt-4 text-2xl font-black text-[color:var(--text)]">Акцент программы</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[(program.goal || "Цель"), (program.level ? levelLabels[program.level] || program.level : "Техника"), "Выносливость", "Контроль прогресса"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-[color:var(--bg)] p-4 font-bold text-[color:var(--text)]"><CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" /> {item}</div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-7">
              <h2 className="text-2xl font-black text-[color:var(--text)]">Твой прогресс</h2>
              <div className="mt-5 rounded-[1.5rem] bg-[color:var(--bg)] p-5">
                <div className="flex items-center justify-between text-sm font-bold text-[color:var(--muted)]"><span>{progress ? "Выполнение" : "Ещё не начата"}</span><span>{progressLoading ? "..." : `${percent}%`}</span></div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-[color:var(--stroke)]"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} /></div>
                {progress ? <div className="mt-3 text-sm text-[color:var(--muted)]">Неделя {progress.current_week || 1} из {totalWeeks}</div> : <div className="mt-3 text-sm text-[color:var(--muted)]">Добавь программу в кабинет, чтобы отслеживать недели.</div>}
              </div>

              {notice ? <div className="mt-4 rounded-2xl bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{notice}</div> : null}
              {error ? <div className="mt-4 rounded-2xl bg-red-500/10 p-3 text-sm font-semibold text-red-700 dark:text-red-300">{error}</div> : null}

              <div className="mt-5 space-y-3">
                {!progress ? (
                  <button type="button" onClick={startProgram} disabled={actionLoading === "start"} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 font-black text-white transition hover:bg-emerald-600 disabled:opacity-60">
                    {actionLoading === "start" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />} Начать программу
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={() => updateProgress(progress.status === "paused" ? "resume" : "next")} disabled={Boolean(actionLoading)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 font-black text-white transition hover:bg-emerald-600 disabled:opacity-60">
                      {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RotateCcw className="h-5 w-5" />} {progress.status === "paused" ? "Продолжить" : "Отметить прогресс"}
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => updateProgress(progress.status === "paused" ? "resume" : "pause")} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 font-bold text-[color:var(--text)]"><Pause className="h-4 w-4" /> Пауза</button>
                      <button type="button" onClick={removeProgress} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 font-bold text-rose-700 dark:text-rose-300"><Trash2 className="h-4 w-4" /> Удалить</button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {program.trainer?.name ? (
              <Link href={`/trainers/${program.trainer.id}`} className="flex items-center gap-4 rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 transition hover:border-emerald-500/35">
                <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-[color:var(--bg)]">
                  {program.trainer.photo_url ? <img src={program.trainer.photo_url} alt={program.trainer.name} className="h-full w-full object-cover" /> : <UserRound className="h-7 w-7 text-emerald-700 dark:text-emerald-300" />}
                </div>
                <div><div className="font-black text-[color:var(--text)]">{program.trainer.name}</div><div className="text-sm text-[color:var(--muted)]">Тренер программы</div></div>
              </Link>
            ) : null}
          </aside>
        </section>

        {(products.length || articles.length) ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            {products.length ? <div><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-2xl font-black text-[color:var(--text)]">Товары к программе</h2><Link href="/shop" className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Магазин</Link></div><div className="grid gap-4 sm:grid-cols-2">{products.map((item) => <RelatedMiniCard key={item.id} item={item} type="product" />)}</div></div> : null}
            {articles.length ? <div><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-2xl font-black text-[color:var(--text)]">Полезные статьи</h2><Link href="/articles" className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Журнал</Link></div><div className="grid gap-4 sm:grid-cols-2">{articles.map((item) => <RelatedMiniCard key={item.id} item={item} type="article" />)}</div></div> : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}

"use client";

import { Activity, ArrowRight, BookOpen, Dumbbell, Info, Target } from "lucide-react";
import ExerciseCard from "./ExerciseCard";

export default function MuscleInfoPanel({ muscle, loading }) {
  if (!muscle) return null;
  const exercises = Array.isArray(muscle.exercises) ? muscle.exercises : [];

  return (
    <aside className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 shadow-[0_18px_60px_rgba(0,0,0,.07)] md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff4d4f]/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.13em] text-[#c52b32]">
          <Target size={14} /> выбранная мышца
        </span>
        {loading ? (
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5 text-xs font-bold text-[color:var(--muted)]">
            обновляю данные…
          </span>
        ) : null}
      </div>

      <h3 className="mt-5 text-4xl font-black tracking-[-0.045em] text-[color:var(--text)]">{muscle.name}</h3>
      {muscle.latin_name ? <div className="mt-1 text-sm font-bold italic text-[color:var(--muted)]">{muscle.latin_name}</div> : null}

      <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">{muscle.description}</p>

      <div className="mt-6 grid gap-3">
        <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">
            <Activity size={16} /> За что отвечает
          </div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{muscle.function}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">
            <Info size={16} /> Как развивать
          </div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{muscle.how_to_grow}</p>
        </div>
      </div>

      <div className="mt-7 border-t border-[color:var(--stroke)] pt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[color:var(--muted)]">
              <Dumbbell size={16} /> упражнения
            </div>
            <h4 className="mt-1 text-2xl font-black text-[color:var(--text)]">Лучшие упражнения</h4>
          </div>
          <a href="/programs" className="hidden items-center gap-2 text-sm font-black text-[color:var(--accent)] sm:inline-flex">
            Программы <ArrowRight size={16} />
          </a>
        </div>

        <div className="mt-4 grid gap-3">
          {exercises.slice(0, 5).map((exercise) => (
            <ExerciseCard key={exercise.slug || exercise.name} exercise={exercise} />
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-[#ff4d4f]/35 bg-[#ff4d4f]/5 p-4 text-sm leading-6 text-[color:var(--muted)]">
          Видео/анимации уже поддерживаются через поле <b>video_url</b>. На MVP можно оставить пустым, потом добавить MP4/WebM или ссылки на страницу упражнения.
        </div>
      </div>
    </aside>
  );
}

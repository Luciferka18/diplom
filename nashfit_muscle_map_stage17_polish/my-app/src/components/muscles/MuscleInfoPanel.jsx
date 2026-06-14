"use client";

import Link from "next/link";
import { Activity, ArrowRight, BookOpen, Dumbbell, Info, Target } from "lucide-react";
import ExerciseCard from "./ExerciseCard";

function levelLabel(value) {
  return {
    beginner: "новичок",
    intermediate: "средний",
    advanced: "продвинутый",
  }[value] || value || "любой уровень";
}

function programHref(program) {
  return program?.href || (program?.id ? `/programs/${program.id}` : "/programs");
}

export default function MuscleInfoPanel({ muscle, loading }) {
  if (!muscle) return null;
  const exercises = Array.isArray(muscle.exercises) ? muscle.exercises : [];
  const relatedPrograms = Array.isArray(muscle.related_programs) ? muscle.related_programs : [];

  return (
    <aside className="rounded-[1.7rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 shadow-[0_18px_60px_rgba(0,0,0,.06)] md:p-5">
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

      <h3 className="mt-4 text-3xl font-black tracking-[-0.045em] text-[color:var(--text)] md:text-4xl">{muscle.name}</h3>
      {muscle.latin_name ? <div className="mt-1 text-xs font-bold italic text-[color:var(--muted)]">{muscle.latin_name}</div> : null}

      <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{muscle.description}</p>

      <div className="mt-5 grid gap-3">
        <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-3.5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">
            <Activity size={15} /> За что отвечает
          </div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{muscle.function}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-3.5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">
            <Info size={15} /> Как развивать
          </div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{muscle.how_to_grow}</p>
        </div>
      </div>

      {relatedPrograms.length ? (
        <div className="mt-5 rounded-2xl border border-[#ff4d4f]/25 bg-[#ff4d4f]/5 p-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#c52b32]">
            <BookOpen size={15} /> программа под мышцу
          </div>
          <div className="mt-3 grid gap-3">
            {relatedPrograms.slice(0, 2).map((program) => (
              <Link
                key={`${program.title}-${program.id || program.href || ""}`}
                href={programHref(program)}
                className="group block rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3.5 transition hover:border-[#ff4d4f]/45"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-black text-[color:var(--text)]">{program.title}</h4>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{program.description}</p>
                  </div>
                  <ArrowRight size={18} className="mt-1 shrink-0 text-[#c52b32] transition group-hover:translate-x-1" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[color:var(--muted)]">
                  <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1">{levelLabel(program.level)}</span>
                  {program.duration_weeks ? (
                    <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1">{program.duration_weeks} нед.</span>
                  ) : null}
                  {program.match_reason ? (
                    <span className="rounded-full border border-[#ff4d4f]/25 bg-[#ff4d4f]/5 px-2.5 py-1 text-[#c52b32]">{program.match_reason}</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 border-t border-[color:var(--stroke)] pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--muted)]">
              <Dumbbell size={15} /> упражнения
            </div>
            <h4 className="mt-1 text-xl font-black text-[color:var(--text)]">Лучшие упражнения для зоны</h4>
          </div>
          <Link href="/programs" className="hidden items-center gap-2 text-sm font-black text-[color:var(--accent)] sm:inline-flex">
            Программы <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-4 grid gap-3">
          {exercises.slice(0, 4).map((exercise) => (
            <ExerciseCard key={exercise.slug || exercise.name} exercise={exercise} />
          ))}
        </div>
      </div>
    </aside>
  );
}

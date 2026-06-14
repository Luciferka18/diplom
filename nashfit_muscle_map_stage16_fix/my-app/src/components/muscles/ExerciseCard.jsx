"use client";

import { Dumbbell, PlayCircle, ShieldCheck } from "lucide-react";
import { difficultyLabel } from "./muscleCatalog";

export default function ExerciseCard({ exercise }) {
  if (!exercise) return null;

  return (
    <article className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3.5 transition hover:-translate-y-0.5 hover:border-[#ff4d4f]/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ff4d4f]/10 px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#c52b32]">
              <ShieldCheck size={13} /> {exercise.role === "primary" ? "основная" : "дополнительная"}
            </span>
            <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1 text-xs font-bold text-[color:var(--muted)]">
              {difficultyLabel(exercise.difficulty)}
            </span>
          </div>
          <h4 className="mt-2 text-base font-black tracking-[-0.02em] text-[color:var(--text)]">{exercise.name}</h4>
          {exercise.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{exercise.description}</p>
          ) : null}
        </div>
        {exercise.video_url ? (
          <a
            href={exercise.video_url}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ff4d4f] text-white"
            aria-label={`Открыть видео: ${exercise.name}`}
          >
            <PlayCircle size={20} />
          </a>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accentGlow)] text-[color:var(--accent)]">
            <Dumbbell size={20} />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[color:var(--muted)]">
        <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1">
          {exercise.equipment || "без оборудования"}
        </span>
        {exercise.primary_muscles?.length ? (
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1">
            осн.: {exercise.primary_muscles.map((item) => item.name || item.slug).join(", ")}
          </span>
        ) : null}
      </div>
    </article>
  );
}

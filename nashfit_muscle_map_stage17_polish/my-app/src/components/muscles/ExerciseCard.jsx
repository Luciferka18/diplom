"use client";

import { Dumbbell, PlayCircle, ShieldCheck } from "lucide-react";
import { difficultyLabel } from "./muscleCatalog";

function muscleNames(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return items.map((item) => item.name || item.slug).filter(Boolean).join(", ");
}

export default function ExerciseCard({ exercise }) {
  if (!exercise) return null;

  const primary = muscleNames(exercise.primary_muscles);
  const secondary = muscleNames(exercise.secondary_muscles);
  const technique = exercise.technique || "Держите корпус стабильно, работайте подконтрольно и не увеличивайте вес за счёт потери техники.";

  return (
    <article className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3.5 transition hover:-translate-y-0.5 hover:border-[#ff4d4f]/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ff4d4f]/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#c52b32]">
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
            <PlayCircle size={19} />
          </a>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accentGlow)] text-[color:var(--accent)]">
            <Dumbbell size={19} />
          </div>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-[color:var(--bg)] px-3 py-2 text-xs leading-5 text-[color:var(--muted)]">
        <b className="text-[color:var(--text)]">Техника:</b> <span className="line-clamp-2">{technique}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[color:var(--muted)]">
        <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1">
          {exercise.equipment || "без оборудования"}
        </span>
        {primary ? (
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1">
            осн.: {primary}
          </span>
        ) : null}
        {secondary ? (
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1">
            доп.: {secondary}
          </span>
        ) : null}
      </div>
    </article>
  );
}

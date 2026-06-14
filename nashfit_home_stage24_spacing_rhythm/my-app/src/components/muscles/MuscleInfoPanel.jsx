"use client";

import Link from "next/link";
import { Activity, ArrowRight, BookOpen, Info, Target } from "lucide-react";

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
  const relatedPrograms = Array.isArray(muscle.related_programs) ? muscle.related_programs : [];

  return (
    <aside className="rounded-[1.4rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff4d4f]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.13em] text-[#c52b32]">
          <Target size={14} /> выбранная мышца
        </span>
        {loading ? <span className="text-xs font-bold text-[color:var(--muted)]">обновляю…</span> : null}
      </div>

      <h3 className="mt-4 text-3xl font-black tracking-[-0.045em] text-[color:var(--text)] md:text-4xl">{muscle.name}</h3>
      {muscle.latin_name ? <div className="mt-1 text-xs font-bold italic text-[color:var(--muted)]">{muscle.latin_name}</div> : null}
      <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{muscle.description}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3.5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--accent)]"><Activity size={15} /> отвечает за</div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{muscle.function}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3.5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--accent)]"><Info size={15} /> как развивать</div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{muscle.how_to_grow}</p>
        </div>
      </div>

      {relatedPrograms.length ? (
        <div className="mt-5 rounded-2xl border border-[#ff4d4f]/25 bg-[#ff4d4f]/5 p-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#c52b32]"><BookOpen size={15} /> программа под мышцу</div>
          <div className="mt-3 grid gap-3">
            {relatedPrograms.slice(0, 1).map((program) => (
              <Link key={`${program.title}-${program.id || program.href || ""}`} href={programHref(program)} className="group block rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3.5 transition hover:border-[#ff4d4f]/45">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-black text-[color:var(--text)]">{program.title}</h4>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{program.description}</p>
                  </div>
                  <ArrowRight size={18} className="mt-1 shrink-0 text-[#c52b32] transition group-hover:translate-x-1" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[color:var(--muted)]">
                  <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1">{levelLabel(program.level)}</span>
                  {program.duration_weeks ? <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1">{program.duration_weeks} нед.</span> : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

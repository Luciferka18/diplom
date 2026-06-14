"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/services/api";
import { Dumbbell } from "lucide-react";
import MuscleMapSvg from "./MuscleMapSvg";
import MuscleInfoPanel from "./MuscleInfoPanel";
import ExerciseCard from "./ExerciseCard";
import { MUSCLE_FALLBACK, MUSCLE_SLUGS, getFallbackMuscle, normalizeMuscle } from "./muscleCatalog";

export default function MuscleMap({ initialSlug = "chest" }) {
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const [hoveredSlug, setHoveredSlug] = useState(null);
  const [muscles, setMuscles] = useState(() => Object.values(MUSCLE_FALLBACK));
  const [activeMuscle, setActiveMuscle] = useState(() => getFallbackMuscle(initialSlug));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    apiGet("/muscles")
      .then((payload) => {
        if (!alive) return;
        const list = Array.isArray(payload) ? payload : payload?.data;
        if (Array.isArray(list) && list.length) setMuscles(list.map((item) => normalizeMuscle(item, item.slug)));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    apiGet(`/muscles/${selectedSlug}`)
      .then((payload) => {
        if (!alive) return;
        setActiveMuscle(normalizeMuscle(payload?.data || payload, selectedSlug));
      })
      .catch(() => {
        if (!alive) return;
        setActiveMuscle(getFallbackMuscle(selectedSlug));
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [selectedSlug]);

  const chipList = useMemo(() => {
    const bySlug = new Map(muscles.map((item) => [item.slug, item]));
    return MUSCLE_SLUGS.map((slug) => bySlug.get(slug) || getFallbackMuscle(slug));
  }, [muscles]);

  const exercises = Array.isArray(activeMuscle?.exercises) ? activeMuscle.exercises : [];

  return (
    <section className="px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 max-w-3xl">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#c52b32]">Интерактивная карта мышц</div>
          <h2 className="text-3xl font-black tracking-[-0.03em] text-[color:var(--text)] md:text-4xl">Выберите мышцу — получите план действий</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">Сохранил чёткую SVG-карту: кликайте по телу или по кнопкам ниже, а справа появятся описание, программа и упражнения.</p>
        </div>

        <div className="rounded-[1.9rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3.5 shadow-[0_18px_60px_rgba(0,0,0,.06)] md:p-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,610px)_minmax(360px,1fr)] xl:items-start">
            <div>
              <MuscleMapSvg selectedSlug={selectedSlug} hoveredSlug={hoveredSlug} setHoveredSlug={setHoveredSlug} onSelect={setSelectedSlug} />
              <div className="mt-4">
                <div className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-[color:var(--muted)]">Быстрый выбор мышцы</div>
                <div className="flex flex-wrap gap-2">
                  {chipList.map((muscle) => {
                    const active = selectedSlug === muscle.slug;
                    return (
                      <button
                        type="button"
                        key={muscle.slug}
                        onClick={() => setSelectedSlug(muscle.slug)}
                        onMouseEnter={() => setHoveredSlug(muscle.slug)}
                        onMouseLeave={() => setHoveredSlug(null)}
                        className={`rounded-full border px-2.5 py-1.5 text-xs font-black transition ${active ? "border-[#ff4d4f] bg-[#ff4d4f] text-white" : "border-[color:var(--stroke)] bg-[color:var(--bg)] text-[color:var(--muted)] hover:border-[#ff4d4f]/50 hover:text-[color:var(--text)]"}`}
                      >
                        {muscle.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <MuscleInfoPanel muscle={activeMuscle} loading={loading} />
          </div>

          {exercises.length ? (
            <div className="mt-5 border-t border-[color:var(--stroke)] pt-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--muted)]"><Dumbbell size={15} /> лучшие упражнения</div>
                  <h3 className="mt-1 text-2xl font-black text-[color:var(--text)]">Что делать для зоны: {activeMuscle.name}</h3>
                </div>
                <div className="text-sm text-[color:var(--muted)]">Техника, ошибки, оборудование и задействованные мышцы</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {exercises.slice(0, 4).map((exercise) => <ExerciseCard key={exercise.slug || exercise.name} exercise={exercise} />)}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

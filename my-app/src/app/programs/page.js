"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/services/api";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        const data = await apiGet("/programs");
        if (!alive) return;
        setPrograms(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.data?.message || e?.message || "Ошибка загрузки программ");
        setPrograms([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <Section title="Программы тренировок" subtitle="Выбирай программу по цели, уровню и длительности.">
      {loading ? (
        <Card>Загрузка...</Card>
      ) : err ? (
        <Card className="text-red-200">{err}</Card>
      ) : programs.length === 0 ? (
        <Card>Программы не найдены</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {programs.map((p) => (
            <Card key={p.id} as={Link} href={`/programs/${p.id}`} className="group h-full">
              <h3 className="text-lg font-semibold">{p.title || p.name}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)] line-clamp-3">{p.description || "Описание скоро появится"}</p>
              <div className="mt-5"><Button variant="ghost" className="group-hover:text-[color:var(--text)]">Открыть программу →</Button></div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}

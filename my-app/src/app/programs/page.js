"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/services/api";

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
    <main className="container-fitlab py-10">
      <h1 className="text-3xl font-bold">Программы тренировок</h1>

      {loading ? (
        <p className="mt-6">Загрузка...</p>
      ) : err ? (
        <p className="mt-6" style={{ color: "#ffb4b4" }}>
          {err}
        </p>
      ) : programs.length === 0 ? (
        <p className="mt-6">Программы не найдены</p>
      ) : (
        <div className="grid gap-4 mt-6">
          {programs.map((p) => (
            <Link key={p.id} href={`/programs/${p.id}`}>
              <div className="card">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

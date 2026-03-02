"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/services/api";

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        const data = await apiGet("/trainers");
        if (!alive) return;
        setTrainers(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.data?.message || e?.message || "Ошибка загрузки тренеров");
        setTrainers([]);
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
      <h1 className="text-3xl font-bold">Наши тренеры</h1>
      <p className="mt-2 text-gray-600">
        Профессионалы, которые приведут тебя к результату
      </p>

      {loading ? (
        <p className="mt-6">Загрузка...</p>
      ) : err ? (
        <p className="mt-6" style={{ color: "#ffb4b4" }}>
          {err}
        </p>
      ) : trainers.length === 0 ? (
        <p className="mt-6">Тренеры не найдены</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {trainers.map((t) => (
            <li key={t.id} className="border rounded-md p-4">
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-gray-600">{t.specialization}</div>

              <Link href={`/trainers/${t.id}`} className="underline mt-2 inline-block">
                Подробнее
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

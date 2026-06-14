"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Loader2,
  PlayCircle,
  Target,
} from "lucide-react";

const statusNames = {
  active: "В процессе",
  paused: "На паузе",
  completed: "Завершена",
};

export default function ProgramProgressOverview() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await apiGet("/account/programs");
        if (!cancelled) {
          setItems(Array.isArray(response?.data) ? response.data : []);
          setSummary(response?.summary || null);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError?.message || "Не удалось загрузить прогресс программ.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card hover={false} className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-[color:var(--text)]">Прогресс программ</h2>
          </div>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Здесь отображаются последние изменения по вашим программам.
          </p>
        </div>
        <Button as={Link} href="/account/programs" variant="outline" size="sm">
          Все программы <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-10 text-[color:var(--muted)]">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          Загрузка прогресса...
        </div>
      ) : error ? (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-[color:var(--stroke)] px-5 py-8 text-center">
          <Dumbbell className="h-9 w-9 text-emerald-400/70" />
          <p className="mt-3 font-semibold text-[color:var(--text)]">Вы ещё не начали ни одной программы</p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Выберите программу, и её прогресс появится в личном кабинете.
          </p>
          <Button as={Link} href="/programs" size="sm" className="mt-4">
            Выбрать программу
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[color:var(--stroke)] p-3">
              <div className="text-2xl font-bold text-[color:var(--text)]">{summary?.total ?? items.length}</div>
              <div className="text-xs text-[color:var(--muted)]">Всего программ</div>
            </div>
            <div className="rounded-xl border border-[color:var(--stroke)] p-3">
              <div className="text-2xl font-bold text-cyan-400">{summary?.active ?? 0}</div>
              <div className="text-xs text-[color:var(--muted)]">В процессе</div>
            </div>
            <div className="rounded-xl border border-[color:var(--stroke)] p-3">
              <div className="text-2xl font-bold text-emerald-400">{summary?.completed ?? 0}</div>
              <div className="text-xs text-[color:var(--muted)]">Завершено</div>
            </div>
            <div className="rounded-xl border border-[color:var(--stroke)] p-3">
              <div className="text-2xl font-bold text-[color:var(--text)]">{summary?.average_progress ?? 0}%</div>
              <div className="text-xs text-[color:var(--muted)]">Средний прогресс</div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {items.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/programs/${item.program?.id}`}
                className="block rounded-xl border border-[color:var(--stroke)] p-4 transition hover:border-emerald-500/40 hover:bg-emerald-500/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-[color:var(--text)]">{item.program?.title}</h3>
                      <Badge
                        className={
                          item.status === "completed"
                            ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                            : "border-cyan-500/30 bg-cyan-500/15 text-cyan-300"
                        }
                      >
                        {item.status === "completed" ? (
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        ) : (
                          <PlayCircle className="mr-1 h-3.5 w-3.5" />
                        )}
                        {statusNames[item.status] || item.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">
                      {item.completed_weeks} из {item.total_weeks} недель
                    </p>
                  </div>
                  <span className="font-bold text-emerald-400">{item.progress_percent}%</span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--bg)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                    style={{ width: `${item.progress_percent}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

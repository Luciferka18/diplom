"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Loader2,
  PauseCircle,
  PlayCircle,
  Target,
} from "lucide-react";

const tabs = [
  ["all", "Все"],
  ["active", "В процессе"],
  ["paused", "На паузе"],
  ["completed", "Завершённые"],
];

const statusNames = {
  active: "В процессе",
  paused: "На паузе",
  completed: "Завершена",
};

function statusIcon(status) {
  if (status === "completed") return CheckCircle2;
  if (status === "paused") return PauseCircle;
  return PlayCircle;
}

export default function AccountProgramsPage() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
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
        if (!cancelled) setError(requestError?.message || "Не удалось загрузить программы.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return items;
    return items.filter((item) => item.status === activeTab);
  }, [activeTab, items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text)] md:text-3xl">Мои программы</h1>
          <p className="mt-1 text-[color:var(--muted)]">
            Отмечайте выполненные недели и следите за общим прогрессом.
          </p>
        </div>
        <Button as={Link} href="/programs">
          <Dumbbell className="h-4 w-4" /> Выбрать программу
        </Button>
      </div>

      {!loading && items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card hover={false} className="p-4">
            <div className="text-2xl font-bold text-[color:var(--text)]">{summary?.total ?? items.length}</div>
            <div className="text-sm text-[color:var(--muted)]">Всего</div>
          </Card>
          <Card hover={false} className="p-4">
            <div className="text-2xl font-bold text-[color:var(--secondary)]">{summary?.active ?? 0}</div>
            <div className="text-sm text-[color:var(--muted)]">В процессе</div>
          </Card>
          <Card hover={false} className="p-4">
            <div className="text-2xl font-bold text-[color:var(--accent)]">{summary?.completed ?? 0}</div>
            <div className="text-sm text-[color:var(--muted)]">Завершено</div>
          </Card>
          <Card hover={false} className="p-4">
            <div className="text-2xl font-bold text-[color:var(--text)]">{summary?.average_progress ?? 0}%</div>
            <div className="text-sm text-[color:var(--muted)]">Средний прогресс</div>
          </Card>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              activeTab === value
                ? "border-emerald-500 bg-[color:var(--accent)] text-white"
                : "border-[color:var(--stroke)] text-[color:var(--muted)] hover:text-[color:var(--text)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <Card hover={false} className="flex items-center justify-center gap-3 py-14">
          <Loader2 className="h-5 w-5 animate-spin text-[color:var(--accent)]" />
          <span className="text-[color:var(--muted)]">Загрузка программ...</span>
        </Card>
      ) : error ? (
        <Card hover={false} className="border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] bg-[color:var(--danger-soft)] text-[color:var(--danger)]">{error}</Card>
      ) : filteredItems.length === 0 ? (
        <Card hover={false} className="flex flex-col items-center py-12 text-center">
          <Target className="h-10 w-10 text-[color:var(--accent)]/70" />
          <h2 className="mt-4 text-lg font-semibold text-[color:var(--text)]">
            {items.length === 0 ? "У вас пока нет программ" : "В этом разделе пока пусто"}
          </h2>
          <p className="mt-1 max-w-md text-sm text-[color:var(--muted)]">
            Начните программу на странице каталога — после этого она появится здесь.
          </p>
          <Button as={Link} href="/programs" className="mt-5">Перейти к программам</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const Icon = statusIcon(item.status);
            return (
              <Card key={item.id} hover={false} className="p-5 md:p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)]">
                    <Dumbbell className="h-8 w-8 text-[color:var(--accent)]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-[color:var(--text)]">{item.program?.title}</h2>
                      <Badge
                        className={
                          item.status === "completed"
                            ? "border-[color:var(--accent-border)] bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
                            : item.status === "paused"
                              ? "border-yellow-500/30 bg-yellow-500/15 text-[color:var(--warning)]"
                              : "border-cyan-500/30 bg-cyan-500/15 text-[color:var(--secondary)]"
                        }
                      >
                        <Icon className="mr-1 h-3.5 w-3.5" /> {statusNames[item.status] || item.status}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-[color:var(--muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4" /> {item.completed_weeks} из {item.total_weeks} недель
                      </span>
                      {item.program?.trainer?.name ? <span>Тренер: {item.program.trainer.name}</span> : null}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[color:var(--bg)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                          style={{ width: `${item.progress_percent}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-bold text-[color:var(--accent)]">{item.progress_percent}%</span>
                    </div>
                  </div>

                  <Button as={Link} href={`/programs/${item.program?.id}`} variant="outline" className="shrink-0">
                    {item.status === "completed" ? "Открыть" : "Продолжить"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

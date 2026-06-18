"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, apiPut } from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Save,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

const rublesToKopecks = (value) => Math.max(0, Math.round(Number(String(value || "0").replace(",", ".")) * 100));
const kopecksToRubles = (value) => String(Math.round(Number(value || 0) / 100));
const serviceWord = (count) => {
  const n = Math.abs(Number(count || 0)) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return "услуг";
  if (n1 > 1 && n1 < 5) return "услуги";
  if (n1 === 1) return "услуга";
  return "услуг";
};

function emptyService(sort = 10) {
  return {
    id: null,
    name: "Новая услуга",
    slug: "",
    description: "",
    duration_minutes: 60,
    price_rub: "2500",
    badge: "",
    is_intro: false,
    is_active: true,
    sort_order: sort,
  };
}

function normalizeService(service, index) {
  return {
    id: service.id ?? null,
    name: service.name || "",
    slug: service.slug || "",
    description: service.description || "",
    duration_minutes: Number(service.duration_minutes || 60),
    price_rub: kopecksToRubles(service.price),
    badge: service.badge || "",
    is_intro: Boolean(service.is_intro),
    is_active: service.is_active !== false,
    sort_order: Number(service.sort_order ?? ((index + 1) * 10)),
  };
}

function errorText(error) {
  const errors = error?.data?.errors;
  if (errors && typeof errors === "object") {
    const lines = Object.values(errors).flat().filter(Boolean);
    if (lines.length) return lines.join(" ");
  }
  return error?.data?.message || error?.message || "Не удалось сохранить услуги";
}

export default function TrainerServicesEditor({
  loadPath,
  savePath,
  title = "Предоставляемые услуги",
  subtitle = "Выберите, какие форматы занятий доступны для записи.",
  backHref = "",
  backLabel = "Назад",
}) {
  const [trainer, setTrainer] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeCount = useMemo(() => services.filter((service) => service.is_active).length, [services]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiGet(loadPath);
      const list = Array.isArray(response?.data) ? response.data : [];
      setTrainer(response?.trainer || null);
      setServices(list.length ? list.map(normalizeService) : [emptyService(10)]);
    } catch (e) {
      setError(errorText(e));
      setServices([emptyService(10)]);
    } finally {
      setLoading(false);
    }
  }, [loadPath]);

  useEffect(() => {
    load();
  }, [load]);

  const updateService = (index, key, value) => {
    setServices((current) => current.map((service, i) => i === index ? { ...service, [key]: value } : service));
  };

  const addService = () => {
    setServices((current) => [...current, emptyService((current.length + 1) * 10)]);
  };

  const removeService = (index) => {
    setServices((current) => {
      if (current.length <= 1) {
        return current.map((service, i) => i === index ? { ...service, is_active: false } : service);
      }
      return current.filter((_, i) => i !== index);
    });
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        services: services.map((service, index) => ({
          id: service.id || null,
          name: String(service.name || "").trim(),
          slug: String(service.slug || "").trim() || null,
          description: String(service.description || "").trim() || null,
          duration_minutes: Number(service.duration_minutes || 60),
          price: rublesToKopecks(service.price_rub),
          badge: String(service.badge || "").trim() || null,
          is_intro: Boolean(service.is_intro),
          is_active: Boolean(service.is_active),
          sort_order: Number(service.sort_order || ((index + 1) * 10)),
        })),
      };

      const response = await apiPut(savePath, payload);
      const list = Array.isArray(response?.data) ? response.data : [];
      setServices(list.map(normalizeService));
      setSuccess("Услуги сохранены. Теперь они сразу доступны на странице записи.");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Card hover={false} className="p-8 text-center text-[color:var(--muted)]">Загрузка услуг…</Card>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {backHref && (
            <Link href={backHref} className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--accent)] hover:underline">
              <ArrowLeft className="h-4 w-4" /> {backLabel}
            </Link>
          )}
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">Услуги тренера</p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[color:var(--text)] md:text-3xl">{title}</h1>
          <p className="mt-1 text-[color:var(--muted)]">{trainer?.name ? `${trainer.name}: ${subtitle}` : subtitle}</p>
        </div>
        <div className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-700 dark:text-emerald-300">
          {activeCount} {serviceWord(activeCount)} активны
        </div>
      </div>

      {error && <Notice type="error" text={error} />}
      {success && <Notice type="success" text={success} />}

      <div className="grid gap-4">
        {services.map((service, index) => (
          <Card key={service.id || `new-${index}`} hover={false} className={service.is_active ? "p-5" : "p-5 opacity-70"}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-sm font-black text-[color:var(--accent)]">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-black text-[color:var(--text)]">{service.name || "Новая услуга"}</h3>
                  <p className="text-sm text-[color:var(--muted)]">{service.duration_minutes || 60} мин · {service.price_rub || 0} ₽</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel-2)] px-3 py-2 text-xs font-bold text-[color:var(--text)]">
                  <input
                    type="checkbox"
                    checked={service.is_active}
                    onChange={(e) => updateService(index, "is_active", e.target.checked)}
                    className="accent-[color:var(--accent)]"
                  />
                  Активна
                </label>
                <Button type="button" variant="outline" size="sm" onClick={() => removeService(index)}>
                  <Trash2 className="h-4 w-4" /> Убрать
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <label className="md:col-span-2">
                <span className="mb-1.5 block text-sm font-bold text-[color:var(--text)]">Название *</span>
                <Input value={service.name} onChange={(e) => updateService(index, "name", e.target.value)} placeholder="Персональная тренировка" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[color:var(--text)]">Длительность, мин *</span>
                <Input type="number" min="15" max="240" step="15" value={service.duration_minutes} onChange={(e) => updateService(index, "duration_minutes", e.target.value)} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[color:var(--text)]">Цена, ₽ *</span>
                <Input type="number" min="0" step="100" value={service.price_rub} onChange={(e) => updateService(index, "price_rub", e.target.value)} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[color:var(--text)]">Бейдж</span>
                <Input value={service.badge} onChange={(e) => updateService(index, "badge", e.target.value)} placeholder="Сила" />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[color:var(--text)]">Порядок</span>
                <Input type="number" min="0" value={service.sort_order} onChange={(e) => updateService(index, "sort_order", e.target.value)} />
              </label>
              <label className="flex items-center gap-2 rounded-[14px] border border-[color:var(--stroke)] bg-[color:var(--elevated)] px-3.5 py-3 text-sm font-bold text-[color:var(--text)]">
                <input
                  type="checkbox"
                  checked={service.is_intro}
                  onChange={(e) => updateService(index, "is_intro", e.target.checked)}
                  className="accent-[color:var(--accent)]"
                />
                Вводная услуга
              </label>
              <label className="md:col-span-4">
                <span className="mb-1.5 block text-sm font-bold text-[color:var(--text)]">Описание</span>
                <Textarea rows={3} value={service.description} onChange={(e) => updateService(index, "description", e.target.value)} placeholder="Что входит в услугу и кому подходит" />
              </label>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={addService}>
          <Plus className="h-4 w-4" /> Добавить услугу
        </Button>
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? <SlidersHorizontal className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
          {saving ? "Сохраняю…" : "Сохранить услуги"}
        </Button>
      </div>
    </div>
  );
}

function Notice({ type, text }) {
  const success = type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <Card hover={false} className={`p-4 ${success ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"}`}>
      <div className={`flex items-center gap-3 ${success ? "text-emerald-600 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>
        <Icon className="h-5 w-5 shrink-0" />
        <span className="font-semibold">{text}</span>
      </div>
    </Card>
  );
}

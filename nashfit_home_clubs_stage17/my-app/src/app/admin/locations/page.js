"use client";

import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/services/api";
import { Building2, ExternalLink, Loader2, MapPin, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";

const empty = {
  name: "",
  address: "",
  description: "",
  phone: "",
  email: "",
  working_hours: "",
  weekend_hours: "",
  features_text: "",
  latitude: "",
  longitude: "",
  map_url: "",
  is_active: true,
  sort_order: 0,
};

function normalize(item = {}) {
  return {
    ...empty,
    ...item,
    features_text: Array.isArray(item.features) ? item.features.join("\n") : item.features_text || "",
    is_active: item.is_active !== false,
    sort_order: item.sort_order || 0,
    latitude: item.latitude || "",
    longitude: item.longitude || "",
  };
}

function payload(form) {
  return {
    ...form,
    features: String(form.features_text || "").split(/[\n,]/).map((item) => item.trim()).filter(Boolean),
    features_text: undefined,
    latitude: form.latitude === "" ? null : Number(form.latitude),
    longitude: form.longitude === "" ? null : Number(form.longitude),
    sort_order: Number(form.sort_order || 0),
    is_active: Boolean(form.is_active),
  };
}

function yandexLink(address) {
  return `https://yandex.ru/maps/?text=${encodeURIComponent(address || "НашФит")}`;
}

export default function AdminLocationsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await apiGet("/admin/locations?per_page=100");
      setItems(response?.data || response || []);
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось загрузить локации");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const activeCount = useMemo(() => items.filter((item) => item.is_active !== false).length, [items]);

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function edit(item) {
    setEditing(item.id);
    setForm(normalize(item));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditing(null);
    setForm(empty);
    setMessage("");
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      if (editing) await apiPut(`/admin/locations/${editing}`, payload(form));
      else await apiPost("/admin/locations", payload(form));
      setMessage(editing ? "Локация обновлена" : "Локация создана");
      reset();
      await load();
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось сохранить локацию");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Удалить ${item.name}?`)) return;
    setBusy(true);
    setError("");
    try {
      await apiDelete(`/admin/locations/${item.id}`);
      await load();
      setMessage("Локация удалена");
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось удалить локацию");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accentGlow)] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--accent)]">
              <Building2 className="h-4 w-4" /> Офлайн-залы
            </div>
            <h1 className="mt-4 text-3xl font-black text-[color:var(--text)] md:text-4xl">Локации и информация для главной</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
              Эти данные показываются на главной странице, в Яндекс.Картах и в подвале сайта. Можно менять адрес, график, телефон, преимущества и ссылку на карту.
            </p>
          </div>
          <button onClick={load} type="button" className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-sm font-black text-[color:var(--text)]">
            <RefreshCw className="h-4 w-4" /> Обновить
          </button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
            <div className="text-2xl font-black text-[color:var(--text)]">{items.length}</div>
            <div className="text-sm text-[color:var(--muted)]">всего локаций</div>
          </div>
          <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
            <div className="text-2xl font-black text-[color:var(--text)]">{activeCount}</div>
            <div className="text-sm text-[color:var(--muted)]">видно на сайте</div>
          </div>
          <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
            <div className="text-2xl font-black text-[color:var(--text)]">Яндекс</div>
            <div className="text-sm text-[color:var(--muted)]">карта без API-ключа</div>
          </div>
        </div>
      </div>

      {(error || message) ? (
        <div className={`rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"}`}>
          {error || message}
        </div>
      ) : null}

      <form onSubmit={submit} className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[color:var(--text)]">{editing ? "Редактировать зал" : "Добавить зал"}</h2>
            <p className="text-sm text-[color:var(--muted)]">Название, адрес, график, контакты и карта.</p>
          </div>
          {editing ? <button type="button" onClick={reset} className="rounded-xl border border-[color:var(--stroke)] p-3 text-[color:var(--muted)]"><X className="h-4 w-4" /></button> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-bold text-[color:var(--text)]">
            Название
            <input value={form.name} onChange={(e) => set("name", e.target.value)} required className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 outline-none focus:border-[color:var(--accent)]" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[color:var(--text)]">
            Телефон
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 outline-none focus:border-[color:var(--accent)]" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[color:var(--text)] md:col-span-2">
            Адрес
            <input value={form.address} onChange={(e) => set("address", e.target.value)} required className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 outline-none focus:border-[color:var(--accent)]" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[color:var(--text)]">
            График будни/основной
            <input value={form.working_hours} onChange={(e) => set("working_hours", e.target.value)} placeholder="Пн–Пт: 07:00–23:00" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 outline-none focus:border-[color:var(--accent)]" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[color:var(--text)]">
            График выходные
            <input value={form.weekend_hours} onChange={(e) => set("weekend_hours", e.target.value)} placeholder="Сб–Вс: 08:00–22:00" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 outline-none focus:border-[color:var(--accent)]" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[color:var(--text)] md:col-span-2">
            Описание
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 outline-none focus:border-[color:var(--accent)]" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[color:var(--text)] md:col-span-2">
            Преимущества, каждое с новой строки
            <textarea value={form.features_text} onChange={(e) => set("features_text", e.target.value)} rows={3} placeholder="Силовая зона\nКардио\nГрупповые классы" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 outline-none focus:border-[color:var(--accent)]" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[color:var(--text)]">
            Широта
            <input value={form.latitude} onChange={(e) => set("latitude", e.target.value)} type="number" step="0.000001" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 outline-none focus:border-[color:var(--accent)]" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[color:var(--text)]">
            Долгота
            <input value={form.longitude} onChange={(e) => set("longitude", e.target.value)} type="number" step="0.000001" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 outline-none focus:border-[color:var(--accent)]" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[color:var(--text)] md:col-span-2">
            Ссылка на iframe Яндекс.Карт, если нужна точная точка
            <input value={form.map_url} onChange={(e) => set("map_url", e.target.value)} placeholder="https://yandex.ru/map-widget/v1/?..." className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 outline-none focus:border-[color:var(--accent)]" />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-sm font-bold text-[color:var(--text)]">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
            Показывать на сайте
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-[color:var(--text)]">
            Порядок
            <input value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} type="number" min="0" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 outline-none focus:border-[color:var(--accent)]" />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 font-black text-white disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editing ? "Сохранить" : "Добавить"}
          </button>
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-5 py-3 font-black text-[color:var(--text)]">
            <Plus className="h-4 w-4" /> Новая локация
          </button>
        </div>
      </form>

      <div className="grid gap-4 xl:grid-cols-2">
        {loading ? (
          <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 text-[color:var(--muted)]">Загрузка...</div>
        ) : items.map((item) => (
          <div key={item.id} className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-[color:var(--text)]">{item.name}</h3>
                  {item.is_active === false ? <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-bold text-red-600">скрыто</span> : null}
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-[color:var(--muted)]"><MapPin className="h-4 w-4" /> {item.address}</div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">{item.working_hours || "График не указан"}</div>
              </div>
              <div className="flex gap-2">
                <a href={yandexLink(item.address)} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[color:var(--stroke)] p-3 text-[color:var(--muted)] hover:text-[color:var(--accent)]"><ExternalLink className="h-4 w-4" /></a>
                <button onClick={() => edit(item)} className="rounded-xl border border-[color:var(--stroke)] px-4 py-3 text-sm font-black text-[color:var(--text)]">Редактировать</button>
                <button onClick={() => remove(item)} className="rounded-xl border border-red-500/30 p-3 text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {item.description ? <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">{item.description}</p> : null}
            {Array.isArray(item.features) && item.features.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.features.map((feature) => <span key={feature} className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1 text-xs font-bold text-[color:var(--text)]">{feature}</span>)}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

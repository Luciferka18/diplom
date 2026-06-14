"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const inputClass = "w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-2.5 text-sm text-[color:var(--text)] outline-none focus:border-emerald-400";

const sourceTypes = [
  ["article", "Статья"],
  ["program", "Программа"],
  ["account", "Личный кабинет"],
];
const targetTypes = [
  ["product", "Товар"],
  ["trainer", "Тренер"],
  ["membership", "Абонемент"],
];

const initialForm = {
  source_type: "article",
  source_id: "",
  target_type: "product",
  target_id: "",
  headline: "",
  description: "",
  cta_label: "",
  is_active: true,
  sort_order: 0,
};

function unwrap(response) {
  const value = response?.data ?? response;
  return Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
}

export default function AdminRecommendationsPage() {
  const [items, setItems] = useState([]);
  const [articles, setArticles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [products, setProducts] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [recommendations, articleResponse, programResponse, productResponse, trainerResponse, membershipResponse] = await Promise.all([
        apiGet("/admin/recommendations"),
        apiGet("/admin/articles?status=all&per_page=100"),
        apiGet("/programs?per_page=100"),
        apiGet("/products?admin=1&per_page=100"),
        apiGet("/trainers"),
        apiGet("/memberships"),
      ]);
      setItems(unwrap(recommendations));
      setArticles(unwrap(articleResponse));
      setPrograms(unwrap(programResponse));
      setProducts(unwrap(productResponse));
      setTrainers(unwrap(trainerResponse));
      setMemberships(unwrap(membershipResponse));
    } catch (requestError) {
      setError(requestError?.data?.message || requestError?.message || "Не удалось загрузить рекомендации.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sourceOptions = useMemo(() => {
    if (form.source_type === "article") return articles.map((item) => ({ id: item.id, label: item.title }));
    if (form.source_type === "program") return programs.map((item) => ({ id: item.id, label: item.title || item.name }));
    return [];
  }, [form.source_type, articles, programs]);

  const targetOptions = useMemo(() => {
    if (form.target_type === "product") return products.map((item) => ({ id: item.id, label: item.name || item.title }));
    if (form.target_type === "trainer") return trainers.map((item) => ({ id: item.id, label: item.name }));
    return memberships.map((item) => ({ id: item.id, label: item.name }));
  }, [form.target_type, products, trainers, memberships]);

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setEditingId(null);
    setForm(initialForm);
  }

  function edit(item) {
    setEditingId(item.id);
    setForm({
      source_type: item.source_type,
      source_id: item.source_id ?? "",
      target_type: item.target_type,
      target_id: item.target_id,
      headline: item.headline || "",
      description: item.description || "",
      cta_label: item.cta_label || "",
      is_active: item.is_active !== false,
      sort_order: item.sort_order || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        source_id: form.source_type === "account" ? null : Number(form.source_id),
        target_id: Number(form.target_id),
        sort_order: Number(form.sort_order || 0),
      };
      if (editingId) await apiPut(`/admin/recommendations/${editingId}`, payload);
      else await apiPost("/admin/recommendations", payload);
      setMessage(editingId ? "Рекомендация обновлена." : "Ручная рекомендация добавлена.");
      reset();
      await load();
    } catch (requestError) {
      setError(requestError?.data?.message || requestError?.message || "Не удалось сохранить рекомендацию.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm("Удалить ручную рекомендацию и вернуть автоматический подбор для этого типа?")) return;
    try {
      await apiDelete(`/admin/recommendations/${item.id}`);
      setMessage("Ручная рекомендация удалена. Автоматический подбор снова активен.");
      await load();
    } catch (requestError) {
      setError(requestError?.data?.message || requestError?.message || "Не удалось удалить рекомендацию.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-400">Контекстная монетизация</p>
          <h1 className="mt-2 text-4xl font-black">Рекомендации</h1>
          <p className="mt-2 max-w-3xl text-[color:var(--muted)]">
            Система автоматически подбирает товары, тренеров и абонементы по теме статьи, программе и прогрессу пользователя. Здесь можно заменить любой тип рекомендации вручную.
          </p>
        </div>
        <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /> Обновить</Button>
      </div>

      <Card hover={false} className="border-emerald-400/20 bg-emerald-400/5 p-5">
        <div className="flex items-start gap-3">
          <WandSparkles className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" />
          <div>
            <h2 className="font-black">Как работает ручная настройка</h2>
            <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
              Пока ручной записи нет, используется автоматический подбор. Добавленная рекомендация заменяет автоматику только для выбранного типа: например, можно вручную выбрать тренера, а товары и абонемент оставить автоматическими.
            </p>
          </div>
        </div>
      </Card>

      {error ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-200">{message}</div> : null}

      <Card hover={false} className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">{editingId ? "Редактировать рекомендацию" : "Добавить ручную рекомендацию"}</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Пустые тексты будут автоматически взяты из карточки товара, тренера или абонемента.</p>
          </div>
          {editingId ? <button type="button" onClick={reset} className="rounded-xl border border-[color:var(--stroke)] p-2 text-[color:var(--muted)] hover:text-white"><X className="h-5 w-5" /></button> : null}
        </div>

        <form onSubmit={save} className="mt-6 grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">Где показывать</span>
            <select className={inputClass} value={form.source_type} onChange={(event) => setForm((current) => ({ ...current, source_type: event.target.value, source_id: "" }))}>
              {sourceTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          {form.source_type !== "account" ? (
            <label>
              <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">Конкретный материал</span>
              <select className={inputClass} value={form.source_id} onChange={(event) => set("source_id", event.target.value)} required>
                <option value="">Выберите…</option>
                {sourceOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
          ) : <div className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-3 text-sm text-[color:var(--muted)]">Будет применено к общему блоку в личном кабинете.</div>}

          <label>
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">Тип предложения</span>
            <select className={inputClass} value={form.target_type} onChange={(event) => setForm((current) => ({ ...current, target_type: event.target.value, target_id: "" }))}>
              {targetTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">Что рекомендовать</span>
            <select className={inputClass} value={form.target_id} onChange={(event) => set("target_id", event.target.value)} required>
              <option value="">Выберите…</option>
              {targetOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">Надпись над карточкой</span>
            <input className={inputClass} value={form.headline} onChange={(event) => set("headline", event.target.value)} placeholder="Рекомендует автор статьи" />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">Текст кнопки</span>
            <input className={inputClass} value={form.cta_label} onChange={(event) => set("cta_label", event.target.value)} placeholder="Записаться" />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">Собственное описание</span>
            <textarea className={`${inputClass} min-h-24`} value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="Почему именно это предложение подходит к материалу" />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">Порядок</span>
            <input type="number" min="0" className={inputClass} value={form.sort_order} onChange={(event) => set("sort_order", event.target.value)} />
          </label>
          <label className="flex items-end gap-2 pb-3 text-sm font-bold">
            <input type="checkbox" checked={!!form.is_active} onChange={(event) => set("is_active", event.target.checked)} /> Активна
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Сохранить" : "Добавить"}
            </Button>
            {editingId ? <Button type="button" variant="outline" onClick={reset}>Отмена</Button> : null}
          </div>
        </form>
      </Card>

      <Card hover={false} className="overflow-hidden p-0">
        <div className="border-b border-[color:var(--stroke)] p-5">
          <h2 className="text-xl font-black">Ручные переопределения</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Всего: {items.length}. Остальные рекомендации работают автоматически.</p>
        </div>
        {loading ? (
          <div className="flex min-h-52 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-emerald-400" /></div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center"><Sparkles className="mx-auto h-9 w-9 text-emerald-400" /><p className="mt-3 font-black">Всё работает автоматически</p><p className="mt-1 text-sm text-[color:var(--muted)]">Ручных переопределений пока нет.</p></div>
        ) : (
          <div className="divide-y divide-[color:var(--stroke)]">
            {items.map((item) => (
              <div key={item.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-400">{sourceTypes.find(([value]) => value === item.source_type)?.[1]}</div>
                  <div className="mt-1 font-black">{item.source_label}</div>
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-[color:var(--muted)]">{targetTypes.find(([value]) => value === item.target_type)?.[1]}</div>
                  <div className="mt-1 font-bold">{item.target_label}</div>
                  {item.headline ? <div className="mt-1 text-xs text-[color:var(--muted)]">{item.headline}</div> : null}
                </div>
                <div className="flex gap-2">
                  {item.source_type !== "account" ? <Link href={item.source_type === "article" ? `/articles/${item.source_id}` : `/programs/${item.source_id}`} className="rounded-xl border border-[color:var(--stroke)] p-2 text-[color:var(--muted)] hover:text-white"><ArrowUpRight className="h-4 w-4" /></Link> : null}
                  <button type="button" onClick={() => edit(item)} className="rounded-xl border border-[color:var(--stroke)] p-2 text-cyan-300"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => remove(item)} className="rounded-xl border border-red-400/25 p-2 text-red-300"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

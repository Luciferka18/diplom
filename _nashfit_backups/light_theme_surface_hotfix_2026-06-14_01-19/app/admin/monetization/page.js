"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/services/api";
import { BadgePercent, CreditCard, Dumbbell, Gift, Pencil, Plus, Save, Trash2, X, Loader2 } from "lucide-react";

const configs = {
  memberships: {
    title: "Абонементы",
    icon: CreditCard,
    defaults: { name: "", slug: "", description: "", duration_months: 1, trial_visits: "", price_rubles: 0, old_price_rubles: "", features_text: "", badge: "", is_trial: false, is_featured: false, is_active: true, sort_order: 0 },
    columns: ["name", "duration_months", "price", "is_active"],
  },
  promotions: {
    title: "Акции",
    icon: Gift,
    defaults: { name: "", slug: "", description: "", discount_type: "percent", discount_value: 10, applies_to: ["all"], auto_apply: false, is_active: true, starts_at: "", ends_at: "", badge: "", banner_title: "", banner_text: "" },
    columns: ["name", "discount_value", "starts_at", "is_active"],
  },
  "promo-codes": {
    title: "Промокоды",
    icon: BadgePercent,
    defaults: { code: "", description: "", discount_type: "percent", discount_value: 10, applies_to: ["all"], minimum_amount_rubles: 0, max_uses: "", per_user_limit: 1, is_active: true, starts_at: "", ends_at: "" },
    columns: ["code", "discount_value", "uses_count", "is_active"],
  },
  "trainer-services": {
    title: "Услуги тренеров",
    icon: Dumbbell,
    defaults: { trainer_id: "", name: "", slug: "", description: "", duration_minutes: 60, price_rubles: 0, badge: "", is_intro: false, is_active: true, sort_order: 0 },
    columns: ["name", "trainer_id", "duration_minutes", "price"],
  },
};

const rub = (kopecks = 0) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(kopecks || 0) / 100);
const columnLabels = {
  name: "Название",
  code: "Код",
  duration_months: "Срок",
  duration_minutes: "Длительность",
  price: "Цена",
  is_active: "Активность",
  discount_value: "Скидка",
  starts_at: "Начало",
  uses_count: "Использований",
  trainer_id: "Тренер",
};

function columnLabel(key) {
  return columnLabels[key] || String(key).replaceAll("_", " ");
}

const dtLocal = (value) => value ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";

function normalize(entity, item) {
  const base = { ...configs[entity].defaults, ...item };
  if (entity === "memberships") {
    base.price_rubles = Number(item.price || 0) / 100;
    base.old_price_rubles = item.old_price == null ? "" : Number(item.old_price) / 100;
    base.features_text = (item.features || []).join("\n");
  }
  if (entity === "trainer-services") base.price_rubles = Number(item.price || 0) / 100;
  if (entity === "promo-codes") base.minimum_amount_rubles = Number(item.minimum_amount || 0) / 100;
  if (["promotions", "promo-codes"].includes(entity)) {
    base.starts_at = dtLocal(item.starts_at);
    base.ends_at = dtLocal(item.ends_at);
    base.applies_to = item.applies_to || ["all"];
  }
  return base;
}

function payload(entity, form) {
  const data = { ...form };
  if (entity === "memberships") {
    data.features = form.features_text.split("\n").map((x) => x.trim()).filter(Boolean);
    delete data.features_text;
    data.duration_months = Number(data.duration_months || 1);
    data.trial_visits = data.trial_visits === "" ? null : Number(data.trial_visits);
    data.price_rubles = Number(data.price_rubles || 0);
    data.old_price_rubles = data.old_price_rubles === "" ? null : Number(data.old_price_rubles);
  }
  if (entity === "trainer-services") {
    data.trainer_id = data.trainer_id === "" ? null : Number(data.trainer_id);
    data.duration_minutes = Number(data.duration_minutes || 60);
    data.price_rubles = Number(data.price_rubles || 0);
  }
  if (entity === "promo-codes") {
    data.minimum_amount_rubles = Number(data.minimum_amount_rubles || 0);
    data.max_uses = data.max_uses === "" ? null : Number(data.max_uses);
    data.per_user_limit = Number(data.per_user_limit || 1);
  }
  if (["promotions", "promo-codes"].includes(entity)) {
    data.discount_value = Number(data.discount_value || 0);
    data.starts_at = data.starts_at ? new Date(data.starts_at).toISOString() : null;
    data.ends_at = data.ends_at ? new Date(data.ends_at).toISOString() : null;
  }
  return data;
}

function Field({ label, children, wide = false }) {
  return <label className={wide ? "md:col-span-2" : ""}><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">{label}</span>{children}</label>;
}
const input = "w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-2.5 text-sm text-[color:var(--text)] outline-none focus:border-emerald-400";

export default function MonetizationAdminPage() {
  const [entity, setEntity] = useState("memberships");
  const [items, setItems] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState(configs.memberships.defaults);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const config = configs[entity];
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [response, trainerResponse] = await Promise.all([
        apiGet(`/admin/monetization/${entity}`),
        entity === "trainer-services" ? apiGet("/trainers") : Promise.resolve({ data: trainers }),
      ]);
      setItems(response?.data || []);
      if (entity === "trainer-services") setTrainers(trainerResponse?.data || []);
    } catch (e) { setError(e?.data?.message || e?.message || "Не удалось загрузить данные"); }
    finally { setLoading(false); }
  }, [entity]);

  useEffect(() => { setForm({ ...configs[entity].defaults }); setEditing(null); load(); }, [entity, load]);

  function set(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }
  function toggleTarget(target) {
    setForm((prev) => {
      const current = prev.applies_to || [];
      if (target === "all") return { ...prev, applies_to: ["all"] };
      const clean = current.filter((x) => x !== "all");
      return { ...prev, applies_to: clean.includes(target) ? clean.filter((x) => x !== target) : [...clean, target] };
    });
  }
  function edit(item) { setEditing(item.id); setForm(normalize(entity, item)); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function reset() { setEditing(null); setForm({ ...config.defaults }); }

  async function save(e) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const data = payload(entity, form);
      if (editing) await apiPut(`/admin/monetization/${entity}/${editing}`, data);
      else await apiPost(`/admin/monetization/${entity}`, data);
      setMessage(editing ? "Изменения сохранены" : "Запись создана"); reset(); await load();
    } catch (e) { setError(e?.data?.message || e?.message || "Не удалось сохранить"); }
    finally { setBusy(false); }
  }

  async function remove(id) {
    if (!confirm("Удалить запись?")) return;
    try { await apiDelete(`/admin/monetization/${entity}/${id}`); await load(); }
    catch (e) { setError(e?.data?.message || e?.message || "Не удалось удалить"); }
  }

  const renderForm = useMemo(() => {
    if (entity === "memberships") return <>
      <Field label="Название"><input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} required /></Field>
      <Field label="Slug"><input className={input} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="Можно оставить пустым" /></Field>
      <Field label="Описание" wide><textarea className={`${input} min-h-24`} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
      <Field label="Срок, месяцев"><input type="number" min="1" className={input} value={form.duration_months} onChange={(e) => set("duration_months", e.target.value)} /></Field>
      <Field label="Пробных посещений"><input type="number" min="1" className={input} value={form.trial_visits} onChange={(e) => set("trial_visits", e.target.value)} /></Field>
      <Field label="Цена, ₽"><input type="number" min="0" step="0.01" className={input} value={form.price_rubles} onChange={(e) => set("price_rubles", e.target.value)} required /></Field>
      <Field label="Старая цена, ₽"><input type="number" min="0" step="0.01" className={input} value={form.old_price_rubles} onChange={(e) => set("old_price_rubles", e.target.value)} /></Field>
      <Field label="Бейдж"><input className={input} value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="Популярный" /></Field>
      <Field label="Порядок"><input type="number" min="0" className={input} value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} /></Field>
      <Field label="Преимущества — по одному в строке" wide><textarea className={`${input} min-h-32`} value={form.features_text} onChange={(e) => set("features_text", e.target.value)} /></Field>
      <div className="md:col-span-2 flex flex-wrap gap-4">{[["is_trial","Пробное предложение"],["is_featured","Выделить тариф"],["is_active","Активен"]].map(([k,l]) => <label key={k} className="flex items-center gap-2 text-sm text-[color:var(--text)]"><input type="checkbox" checked={!!form[k]} onChange={(e) => set(k, e.target.checked)} />{l}</label>)}</div>
    </>;

    if (entity === "trainer-services") return <>
      <Field label="Тренер"><select className={input} value={form.trainer_id} onChange={(e) => set("trainer_id", e.target.value)}><option value="">Для всех тренеров</option>{trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
      <Field label="Название"><input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} required /></Field>
      <Field label="Описание" wide><textarea className={`${input} min-h-24`} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
      <Field label="Длительность, минут"><input type="number" min="15" className={input} value={form.duration_minutes} onChange={(e) => set("duration_minutes", e.target.value)} required /></Field>
      <Field label="Цена, ₽"><input type="number" min="0" step="0.01" className={input} value={form.price_rubles} onChange={(e) => set("price_rubles", e.target.value)} required /></Field>
      <Field label="Бейдж"><input className={input} value={form.badge} onChange={(e) => set("badge", e.target.value)} /></Field>
      <Field label="Порядок"><input type="number" min="0" className={input} value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} /></Field>
      <div className="md:col-span-2 flex gap-4">{[["is_intro","Вводная услуга"],["is_active","Активна"]].map(([k,l]) => <label key={k} className="flex items-center gap-2 text-sm text-[color:var(--text)]"><input type="checkbox" checked={!!form[k]} onChange={(e) => set(k, e.target.checked)} />{l}</label>)}</div>
    </>;

    const promoCode = entity === "promo-codes";
    return <>
      <Field label={promoCode ? "Код" : "Название"}><input className={input} value={promoCode ? form.code : form.name} onChange={(e) => set(promoCode ? "code" : "name", promoCode ? e.target.value.toUpperCase() : e.target.value)} required /></Field>
      <Field label="Тип скидки"><select className={input} value={form.discount_type} onChange={(e) => set("discount_type", e.target.value)}><option value="percent">Процент</option><option value="fixed">Фиксированная сумма, ₽</option></select></Field>
      <Field label="Размер скидки"><input type="number" min="0" step="0.01" className={input} value={form.discount_value} onChange={(e) => set("discount_value", e.target.value)} required /></Field>
      {promoCode ? <Field label="Минимальная сумма, ₽"><input type="number" min="0" className={input} value={form.minimum_amount_rubles} onChange={(e) => set("minimum_amount_rubles", e.target.value)} /></Field> : <Field label="Бейдж"><input className={input} value={form.badge} onChange={(e) => set("badge", e.target.value)} /></Field>}
      <Field label="Описание" wide><textarea className={`${input} min-h-20`} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
      <Field label="Начало"><input type="datetime-local" className={input} value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} /></Field>
      <Field label="Окончание"><input type="datetime-local" className={input} value={form.ends_at} onChange={(e) => set("ends_at", e.target.value)} /></Field>
      {promoCode ? <><Field label="Общий лимит"><input type="number" min="1" className={input} value={form.max_uses} onChange={(e) => set("max_uses", e.target.value)} /></Field><Field label="Лимит на пользователя"><input type="number" min="1" className={input} value={form.per_user_limit} onChange={(e) => set("per_user_limit", e.target.value)} /></Field></> : <><Field label="Заголовок баннера"><input className={input} value={form.banner_title} onChange={(e) => set("banner_title", e.target.value)} /></Field><Field label="Текст баннера"><input className={input} value={form.banner_text} onChange={(e) => set("banner_text", e.target.value)} /></Field></>}
      <div className="md:col-span-2"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">Действует для</div><div className="flex flex-wrap gap-3">{[["all","Всего"],["membership","Абонементов"],["booking","Тренировок"],["store","Магазина"]].map(([k,l]) => <label key={k} className="flex items-center gap-2 rounded-xl border border-[color:var(--stroke)] px-3 py-2 text-sm text-[color:var(--text)]"><input type="checkbox" checked={(form.applies_to || []).includes(k)} onChange={() => toggleTarget(k)} />{l}</label>)}</div></div>
      <div className="md:col-span-2 flex gap-4">{!promoCode ? <label className="flex items-center gap-2 text-sm text-[color:var(--text)]"><input type="checkbox" checked={!!form.auto_apply} onChange={(e) => set("auto_apply", e.target.checked)} />Автоматическая акция</label> : null}<label className="flex items-center gap-2 text-sm text-[color:var(--text)]"><input type="checkbox" checked={!!form.is_active} onChange={(e) => set("is_active", e.target.checked)} />Активно</label></div>
    </>;
  }, [entity, form, trainers]);

  function cell(item, key) {
    if (key === "price") return rub(item.price);
    if (key === "is_active") return item.is_active ? "Да" : "Нет";
    if (key === "discount_value") return `${item.discount_value}${item.discount_type === "percent" ? "%" : " ₽"}`;
    if (key === "starts_at") return item.starts_at ? new Date(item.starts_at).toLocaleDateString("ru-RU") : "Без даты";
    if (key === "trainer_id") return item.trainer?.name || "Все тренеры";
    if (key === "duration_months") return item.duration_months ? `${item.duration_months} мес.` : "Пробный";
    return item[key] ?? "—";
  }

  return (
    <div className="space-y-6">
      <div><span className="text-xs font-bold uppercase tracking-[.2em] text-emerald-400">Монетизация</span><h1 className="mt-2 text-3xl font-black text-[color:var(--text)]">Абонементы, акции и услуги</h1><p className="mt-1 text-[color:var(--muted)]">Единая база для mock-оплаты и будущего подключения реального провайдера.</p></div>
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-2 lg:grid-cols-4">{Object.entries(configs).map(([key, value]) => { const Icon = value.icon; return <button key={key} onClick={() => setEntity(key)} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${entity === key ? "bg-emerald-400 text-slate-950" : "text-[color:var(--muted)] hover:bg-[color:var(--bg)]"}`}><Icon className="h-4 w-4" />{value.title}</button>; })}</div>

      {message ? <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-emerald-200">{message}</div> : null}
      {error ? <div className="rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-red-200">{error}</div> : null}

      <form onSubmit={save} className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-7">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-black text-[color:var(--text)]">{editing ? "Редактирование" : `Добавить: ${config.title.toLowerCase()}`}</h2><p className="text-sm text-[color:var(--muted)]">Изменения сразу используются на публичных страницах.</p></div>{editing ? <button type="button" onClick={reset} className="rounded-xl border border-[color:var(--stroke)] p-2 text-[color:var(--muted)]"><X className="h-5 w-5" /></button> : null}</div>
        <div className="grid gap-4 md:grid-cols-2">{renderForm}</div>
        <button disabled={busy} className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 disabled:opacity-60">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : editing ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}{busy ? "Сохраняем…" : editing ? "Сохранить" : "Создать"}</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)]">
        <div className="border-b border-[color:var(--stroke)] p-5"><h2 className="text-xl font-black text-[color:var(--text)]">{config.title}</h2></div>
        {loading ? <div className="flex items-center gap-2 p-6 text-[color:var(--muted)]"><Loader2 className="h-5 w-5 animate-spin" />Загрузка…</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[color:var(--bg)] text-xs uppercase tracking-wider text-[color:var(--muted)]"><tr>{config.columns.map((k) => <th key={k} className="px-5 py-3">{columnLabel(k)}</th>)}<th className="px-5 py-3 text-right">Действия</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-[color:var(--stroke)]"><td className="px-5 py-4 font-bold text-[color:var(--text)]">{cell(item, config.columns[0])}</td>{config.columns.slice(1).map((k) => <td key={k} className="px-5 py-4 text-[color:var(--muted)]">{cell(item, k)}</td>)}<td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => edit(item)} className="rounded-lg border border-[color:var(--stroke)] p-2 text-cyan-300"><Pencil className="h-4 w-4" /></button><button onClick={() => remove(item.id)} className="rounded-lg border border-red-400/20 p-2 text-red-300"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table>{items.length === 0 ? <div className="p-8 text-center text-[color:var(--muted)]">Пока нет записей.</div> : null}</div>}
      </section>
    </div>
  );
}

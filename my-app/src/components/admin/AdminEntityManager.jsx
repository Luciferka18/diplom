"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

const CONFIG = {
  products: {
    title: "Товары",
    description: "Каталог магазина, цены и остатки",
    nameKey: "name",
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "price", label: "Цена, ₽", type: "number", required: true, step: "0.01" },
      { key: "stock", label: "Остаток", type: "number", min: "0" },
      { key: "category_id", label: "ID категории", type: "number", min: "1" },
      { key: "image_url", label: "Ссылка на изображение", type: "url", wide: true },
      { key: "description", label: "Описание", type: "textarea", wide: true },
    ],
    columns: [
      { key: "name", label: "Товар" },
      { key: "price", label: "Цена", format: (v) => money(v) },
      { key: "stock", label: "Остаток" },
    ],
  },
  programs: {
    title: "Программы",
    description: "Бесплатные тренировочные программы. План создаётся автоматически по длительности и уровню.",
    nameKey: "title",
    fields: [
      { key: "title", label: "Название", required: true },
      {
        key: "level",
        label: "Уровень",
        type: "select",
        required: true,
        options: [
          ["beginner", "Начальный"],
          ["intermediate", "Средний"],
          ["advanced", "Продвинутый"],
        ],
      },
      { key: "duration_weeks", label: "Длительность, недель", type: "number", min: "1", max: "52", required: true },
      { key: "trainer_id", label: "ID тренера", type: "number", min: "1" },
      { key: "image_url", label: "Ссылка на изображение", type: "url", wide: true },
      { key: "description", label: "Описание", type: "textarea", required: true, wide: true },
    ],
    columns: [
      { key: "title", label: "Программа" },
      { key: "level", label: "Уровень" },
      { key: "duration_weeks", label: "Недель" },
      { key: "workouts_count", label: "Тренировок" },
      { key: "id", label: "Доступ", format: () => "Бесплатно" },
    ],
  },
  trainers: {
    title: "Тренеры",
    description: "Профили специалистов и контактные данные",
    nameKey: "name",
    fields: [
      { key: "name", label: "Имя", required: true },
      { key: "specialization", label: "Специализация", required: true },
      { key: "experience_years", label: "Опыт, лет", type: "number", min: "0", max: "60" },
      { key: "age", label: "Возраст", type: "number", min: "18", max: "100" },
      { key: "phone", label: "Телефон", type: "tel" },
      { key: "instagram", label: "ВКонтакте" },
      { key: "user_id", label: "ID пользователя", type: "number", min: "1" },
      { key: "photo_url", label: "Ссылка на фото", type: "url", wide: true },
      { key: "bio", label: "О тренере", type: "textarea", wide: true },
    ],
    columns: [
      { key: "name", label: "Тренер" },
      { key: "specialization", label: "Специализация" },
      { key: "experience_years", label: "Опыт" },
      { key: "phone", label: "Телефон" },
    ],
  },
  articles: {
    title: "Статьи",
    description: "Материалы блога и публикации",
    nameKey: "title",
    fields: [
      { key: "title", label: "Заголовок", required: true },
      { key: "slug", label: "Slug" },
      {
        key: "status",
        label: "Статус",
        type: "select",
        options: [["draft", "Черновик"], ["published", "Опубликована"]],
      },
      { key: "published_at", label: "Дата публикации", type: "datetime-local" },
      { key: "author_user_id", label: "ID автора", type: "number", min: "1" },
      { key: "content", label: "Содержание", type: "textarea", required: true, wide: true, rows: 12 },
    ],
    columns: [
      { key: "title", label: "Статья" },
      { key: "status", label: "Статус", badge: true, format: statusLabel },
      { key: "published_at", label: "Публикация", format: dateTime },
    ],
  },
  categories: {
    title: "Категории",
    description: "Категории товаров",
    nameKey: "name",
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "slug", label: "Slug" },
    ],
    columns: [{ key: "name", label: "Название" }, { key: "slug", label: "Slug" }],
  },
  tags: {
    title: "Теги",
    description: "Теги контента",
    nameKey: "name",
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "slug", label: "Slug" },
    ],
    columns: [{ key: "name", label: "Название" }, { key: "slug", label: "Slug" }],
  },
  locations: {
    title: "Локации",
    description: "Адреса спортивных залов",
    nameKey: "name",
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "address", label: "Адрес", required: true, wide: true },
    ],
    columns: [{ key: "name", label: "Локация" }, { key: "address", label: "Адрес" }],
  },
  orders: {
    title: "Заказы",
    description: "Оплата, доставка и статусы заказов",
    nameKey: "customer_name",
    readOnly: true,
    statusOptions: [
      ["new", "Новый"],
      ["created", "Создан"],
      ["awaiting_payment", "Ожидает оплаты"],
      ["paid", "Оплачен"],
      ["processing", "Собирается"],
      ["shipped", "Отправлен"],
      ["completed", "Завершён"],
      ["cancelled", "Отменён"],
      ["refunded", "Возврат"],
    ],
    columns: [
      { key: "id", label: "№", format: (v) => `#${v}` },
      { key: "customer_name", label: "Покупатель" },
      { key: "customer_phone", label: "Телефон" },
      { key: "total", label: "Сумма", format: orderMoney },
      { key: "status", label: "Статус", badge: true, format: statusLabel },
      { key: "created_at", label: "Создан", format: dateTime },
    ],
  },
  bookings: {
    title: "Записи",
    description: "Записи клиентов к тренерам",
    nameKey: "client_name",
    readOnly: true,
    statusOptions: [["booked", "Записан"], ["completed", "Завершён"], ["cancelled", "Отменён"]],
    columns: [
      { key: "id", label: "№", format: (v) => `#${v}` },
      { key: "client_name", label: "Клиент" },
      { key: "client_phone", label: "Телефон" },
      { key: "trainer.name", label: "Тренер" },
      { key: "starts_at", label: "Начало", format: dateTime },
      { key: "status", label: "Статус", badge: true, format: statusLabel },
    ],
  },
  reviews: {
    title: "Отзывы",
    description: "Отзывы пользователей — просмотр и удаление",
    nameKey: "text",
    readOnly: true,
    columns: [
      { key: "id", label: "№", format: (v) => `#${v}` },
      { key: "user.name", label: "Автор" },
      { key: "rating", label: "Оценка", format: (v) => `${v ?? 0} / 5` },
      { key: "reviewable_type", label: "Объект", format: shortType },
      { key: "text", label: "Текст", truncate: true },
      { key: "created_at", label: "Дата", format: dateTime },
    ],
  },
};

function money(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 2 }).format(number);
}

function orderMoney(value) {
  const number = Number(value || 0);
  return money(number > 10000 ? number / 100 : number);
}

function dateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

function shortType(value) {
  if (!value) return "—";
  return String(value).split("\\").pop();
}

const STATUS_LABELS = {
  new: "Новый",
  created: "Создан",
  awaiting_payment: "Ожидает оплаты",
  pending: "Ожидает",
  paid: "Оплачен",
  processing: "Собирается",
  shipped: "Отправлен",
  completed: "Завершён",
  cancelled: "Отменён",
  refunded: "Возврат",
  booked: "Записан",
  draft: "Черновик",
  published: "Опубликована",
  rejected: "Отклонена",
  archived: "В архиве",
};

function statusLabel(value) {
  const key = String(value || "").toLowerCase();
  return STATUS_LABELS[key] || value || "—";
}

function getValue(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function emptyForm(fields = []) {
  return Object.fromEntries(fields.map((field) => [field.key, field.type === "select" ? field.options?.[0]?.[0] ?? "" : ""]));
}

function normalizeForForm(item, fields = []) {
  return Object.fromEntries(fields.map((field) => {
    let value = item?.[field.key] ?? "";
    if (field.type === "datetime-local" && value) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    return [field.key, value];
  }));
}

function cleanPayload(form, fields = []) {
  const payload = {};
  for (const field of fields) {
    let value = form[field.key];
    if (value === "") {
      payload[field.key] = null;
      continue;
    }
    if (field.type === "number") value = Number(value);
    if (field.type === "datetime-local" && value) value = new Date(value).toISOString();
    payload[field.key] = value;
  }
  return payload;
}

export default function AdminEntityManager({ entity }) {
  const config = CONFIG[entity];
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(() => emptyForm(config?.fields));

  const load = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    setError("");
    try {
      const response = await apiGet(`/admin/${entity}?per_page=100`);
      setItems(Array.isArray(response) ? response : response?.data ?? []);
      setMeta(Array.isArray(response) ? null : response);
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось загрузить данные");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [entity, config]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }, [items, search]);

  function resetForm() {
    setEditing(null);
    setForm(emptyForm(config.fields));
  }

  function startEdit(item) {
    setEditing(item);
    setForm(normalizeForForm(item, config.fields));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const payload = cleanPayload(form, config.fields);
      if (editing?.id) {
        await apiPut(`/admin/${entity}/${editing.id}`, payload);
        setSuccess("Изменения сохранены");
      } else {
        await apiPost(`/admin/${entity}`, payload);
        setSuccess("Запись создана");
      }
      resetForm();
      await load();
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось сохранить запись");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item) {
    const label = item?.[config.nameKey] || `#${item.id}`;
    if (!window.confirm(`Удалить «${label}»?`)) return;
    setBusy(true);
    setError("");
    try {
      await apiDelete(`/admin/${entity}/${item.id}`);
      setSuccess("Запись удалена");
      if (editing?.id === item.id) resetForm();
      await load();
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось удалить запись");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(item, status) {
    setBusy(true);
    setError("");
    try {
      await apiPatch(`/admin/${entity}/${item.id}/status`, { status });
      setSuccess("Статус обновлён");
      await load();
    } catch (e) {
      setError(e?.data?.message || e?.message || "Не удалось изменить статус");
    } finally {
      setBusy(false);
    }
  }

  if (!config) {
    return <Card hover={false}><div className="font-semibold">Неизвестный раздел</div></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">Администрирование</p>
          <h1 className="mt-1 text-2xl font-bold text-[color:var(--text)] md:text-3xl">{config.title}</h1>
          <p className="mt-1 text-[color:var(--muted)]">{config.description}</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading || busy}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      {error && <Notice type="error" text={error} />}
      {success && <Notice type="success" text={success} />}

      {!config.readOnly && (
        <Card hover={false} className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[color:var(--text)]">{editing ? `Редактирование #${editing.id}` : "Новая запись"}</h2>
              <p className="text-sm text-[color:var(--muted)]">Заполните поля и сохраните изменения</p>
            </div>
            {editing && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" /> Отмена
              </Button>
            )}
          </div>

          <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={form[field.key] ?? ""}
                onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
              />
            ))}
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Button type="submit" disabled={busy}>
                {editing ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editing ? "Сохранить" : "Создать"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={busy}>Очистить</Button>
            </div>
          </form>
        </Card>
      )}

      <Card hover={false} className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-[color:var(--stroke)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-[color:var(--text)]">Список</h2>
            <p className="text-sm text-[color:var(--muted)]">Всего: {meta?.total ?? items.length}</p>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по разделу" className="pl-9" />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-[color:var(--muted)]">Загрузка…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[color:var(--muted)]">Ничего не найдено</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[color:var(--bg)] text-xs uppercase tracking-wide text-[color:var(--muted)]">
                <tr>
                  {config.columns.map((column) => <th key={column.key} className="px-4 py-3 font-semibold">{column.label}</th>)}
                  <th className="px-4 py-3 text-right font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--stroke)]">
                {filtered.map((item) => (
                  <tr key={item.id} className="text-[color:var(--text)] hover:bg-[color:var(--bg)]/70">
                    {config.columns.map((column) => {
                      const value = getValue(item, column.key);
                      const display = column.format ? column.format(value, item) : value ?? "—";
                      return (
                        <td key={column.key} className={`px-4 py-3 ${column.truncate ? "max-w-[320px] truncate" : ""}`} title={column.truncate ? String(display) : undefined}>
                          {column.badge ? <StatusBadge value={display} status={value} /> : String(display)}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {config.statusOptions && (
                          <select
                            value={item.status || ""}
                            disabled={busy}
                            onChange={(e) => changeStatus(item, e.target.value)}
                            className="h-9 rounded-lg border border-[color:var(--stroke)] bg-[color:var(--panel)] px-2 text-xs text-[color:var(--text)]"
                            aria-label={`Статус записи ${item.id}`}
                          >
                            {config.statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                        )}
                        {!config.readOnly && (
                          <Button variant="outline" size="sm" onClick={() => startEdit(item)} disabled={busy} aria-label="Редактировать">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => remove(item)} disabled={busy} className="border-red-500/30 text-red-500 hover:bg-red-500/10" aria-label="Удалить">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Field({ field, value, onChange }) {
  const common = {
    id: field.key,
    value,
    required: field.required,
    onChange: (event) => onChange(event.target.value),
  };

  return (
    <label className={field.wide ? "md:col-span-2" : ""} htmlFor={field.key}>
      <span className="mb-1.5 block text-sm font-medium text-[color:var(--text)]">
        {field.label}{field.required ? " *" : ""}
      </span>
      {field.type === "textarea" ? (
        <Textarea {...common} rows={field.rows || 5} />
      ) : field.type === "select" ? (
        <select {...common} className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]">
          {field.options.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}
        </select>
      ) : (
        <Input {...common} type={field.type || "text"} min={field.min} max={field.max} step={field.step} />
      )}
    </label>
  );
}

function StatusBadge({ value, status: rawStatus }) {
  const status = String(rawStatus || "").toLowerCase();
  const className = ["paid", "published", "completed", "booked"].includes(status)
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
    : ["cancelled", "refunded", "rejected"].includes(status)
      ? "border-red-500/30 bg-red-500/10 text-red-500"
      : status === "shipped"
        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
        : status === "processing"
          ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-500";
  return <Badge className={className}>{value || "—"}</Badge>;
}

function Notice({ type, text }) {
  const success = type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <Card hover={false} className={`p-4 ${success ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"}`}>
      <div className={`flex items-center gap-3 ${success ? "text-emerald-500" : "text-red-500"}`}>
        <Icon className="h-5 w-5 shrink-0" />
        <span>{text}</span>
      </div>
    </Card>
  );
}

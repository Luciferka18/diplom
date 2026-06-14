export const ARTICLE_CATEGORIES = [
  { value: "all", label: "Все материалы" },
  { value: "training", label: "Тренировки" },
  { value: "nutrition", label: "Питание" },
  { value: "recovery", label: "Восстановление" },
  { value: "health", label: "Здоровье" },
  { value: "motivation", label: "Мотивация" },
];

export const ARTICLE_STATUSES = {
  draft: { label: "Черновик", className: "border-slate-400/25 bg-slate-400/10 text-slate-300" },
  pending: { label: "На модерации", className: "border-amber-400/25 bg-[color:var(--warning-soft)] text-[color:var(--warning)]" },
  published: { label: "Опубликована", className: "border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]" },
  rejected: { label: "Отклонена", className: "border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] bg-[color:var(--danger-soft)] text-[color:var(--danger)]" },
  archived: { label: "В архиве", className: "border-[color:var(--warm-border)] bg-[color:var(--warm-soft)] text-[color:var(--warm)]" },
};

export function categoryLabel(value) {
  return ARTICLE_CATEGORIES.find((item) => item.value === value)?.label || "Фитнес";
}

export function articleDate(value) {
  if (!value) return "Недавно";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Недавно";
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export function articleGradient(category) {
  const gradients = {
    training: "from-[color:var(--secondary)] via-[color:var(--secondary-soft)] to-[color:var(--accent)]",
    nutrition: "from-[color:var(--accent)] via-[color:var(--accent-soft)] to-[color:var(--warm)]",
    recovery: "from-[color:var(--secondary)] via-[color:var(--panel-2)] to-[color:var(--warm)]",
    health: "from-[color:var(--warm)] via-[color:var(--warm-soft)] to-[color:var(--accent)]",
    motivation: "from-[color:var(--accent-strong)] via-[color:var(--accent-soft)] to-[color:var(--secondary)]",
  };
  return gradients[category] || gradients.training;
}

export function unwrapCollection(response) {
  if (Array.isArray(response)) return response;
  return Array.isArray(response?.data) ? response.data : [];
}

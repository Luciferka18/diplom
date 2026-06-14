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
  pending: { label: "На модерации", className: "border-amber-400/25 bg-amber-400/10 text-amber-300" },
  published: { label: "Опубликована", className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" },
  rejected: { label: "Отклонена", className: "border-red-400/25 bg-red-400/10 text-red-300" },
  archived: { label: "В архиве", className: "border-violet-400/25 bg-violet-400/10 text-violet-300" },
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
    training: "from-cyan-500/30 via-sky-500/15 to-emerald-500/20",
    nutrition: "from-lime-500/25 via-emerald-500/15 to-teal-500/25",
    recovery: "from-violet-500/25 via-indigo-500/15 to-cyan-500/20",
    health: "from-rose-500/20 via-orange-500/15 to-amber-500/20",
    motivation: "from-fuchsia-500/20 via-violet-500/15 to-blue-500/20",
  };
  return gradients[category] || gradients.training;
}

export function unwrapCollection(response) {
  if (Array.isArray(response)) return response;
  return Array.isArray(response?.data) ? response.data : [];
}

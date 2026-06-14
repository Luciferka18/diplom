import { ARTICLE_STATUSES } from "@/lib/articles";

export default function ArticleStatusBadge({ status }) {
  const config = ARTICLE_STATUSES[status] || ARTICLE_STATUSES.draft;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

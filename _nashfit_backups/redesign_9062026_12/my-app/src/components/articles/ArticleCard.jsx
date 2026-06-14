import Link from "next/link";
import { BadgeCheck, Bookmark, Clock3, Eye, Sparkles } from "lucide-react";
import { articleDate, articleGradient, categoryLabel } from "@/lib/articles";

export default function ArticleCard({ article, featured = false }) {
  const authorName = article?.author?.name || "Редакция НашФит";
  const trainer = article?.is_trainer_article || article?.author?.is_trainer;

  return (
    <Link
      href={`/articles/${article.id}`}
      className={`group overflow-hidden rounded-3xl border bg-[color:var(--panel)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_var(--accentGlow)] ${
        trainer ? "border-emerald-400/30" : "border-[color:var(--stroke)]"
      } ${featured ? "grid min-h-[430px] lg:grid-cols-[1.15fr_.85fr]" : "flex h-full flex-col"}`}
    >
      <div className={`relative overflow-hidden ${featured ? "min-h-[280px]" : "aspect-[16/10]"}`}>
        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${articleGradient(article.category)}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,.22),transparent_42%)]" />
            <Sparkles className="absolute bottom-8 left-8 h-12 w-12 text-white/60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
        <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-slate-950/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          {categoryLabel(article.category)}
        </span>
        {trainer ? (
          <span className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-500/90 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-lg">
            <BadgeCheck className="h-4 w-4" /> Статья тренера
          </span>
        ) : null}
      </div>

      <div className={`flex flex-1 flex-col ${featured ? "p-7 lg:p-9" : "p-5"}`}>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
          <span>{articleDate(article.published_at || article.created_at)}</span>
          <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {article.reading_time_minutes || 1} мин</span>
        </div>
        <h2 className={`${featured ? "text-3xl lg:text-4xl" : "text-xl"} font-black leading-tight text-[color:var(--text)] transition group-hover:text-emerald-400`}>
          {article.title}
        </h2>
        <p className={`mt-3 text-[color:var(--muted)] ${featured ? "text-base leading-7" : "line-clamp-3 text-sm leading-6"}`}>
          {article.excerpt || "Полезный материал о тренировках, здоровье и восстановлении."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[color:var(--text)]">{authorName}</p>
            {trainer && article?.author?.trainer?.specialization ? (
              <p className="truncate text-xs text-emerald-400">{article.author.trainer.specialization}</p>
            ) : (
              <p className="text-xs text-[color:var(--muted)]">Автор НашФит</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs text-[color:var(--muted)]">
            <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {article.views_count || 0}</span>
            <Bookmark className={`h-4 w-4 ${article.is_favorited ? "fill-emerald-400 text-emerald-400" : ""}`} />
          </div>
        </div>
      </div>
    </Link>
  );
}

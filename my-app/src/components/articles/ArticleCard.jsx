import Link from "next/link";
import { BadgeCheck, Bookmark, Clock3, Eye, Sparkles } from "lucide-react";
import { articleDate, categoryLabel } from "@/lib/articles";

function normalizeKey(value) {
  return String(value || "").toLowerCase().trim().replace(/ё/g, "е").replace(/й/g, "и").replace(/[^a-zа-я0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function isBadImage(value) {
  const path = String(value || "").toLowerCase();
  return !path || path.includes("/demo/") || path.includes("placeholder") || path.includes("gradient") || path.endsWith(".svg");
}

const articleImages = {
  "kak-nachat-trenirovatsya-ponyatnyy-plan-dlya-novichka": "/seed-images/articles/kak-nachat-trenirovatsya.png",
  "как-начать-тренироваться-понятныи-план-для-новичка": "/seed-images/articles/kak-nachat-trenirovatsya.png",
  "pitanie-dlya-nabora-myshechnoy-massy": "/seed-images/articles/pitanie-dlya-massy.png",
  "питание-для-набора-мышечнои-массы": "/seed-images/articles/pitanie-dlya-massy.png",
  "yoga-dlya-nachinayushchikh-pervye-shagi": "/seed-images/articles/yoga-dlya-nachinayushchikh.png",
  "иога-для-начинающих-первые-шаги": "/seed-images/articles/yoga-dlya-nachinayushchikh.png",
  "5-oshibok-pri-pokhudenii": "/seed-images/articles/oshibki-pri-pokhudenii.png",
  "5-ошибок-при-похудении": "/seed-images/articles/oshibki-pri-pokhudenii.png",
  "vosstanovlenie-posle-trenirovki": "/seed-images/articles/vosstanovlenie-posle-trenirovki.png",
  "восстановление-после-тренировки": "/seed-images/articles/vosstanovlenie-posle-trenirovki.png",
  "kak-sostavit-plan-trenirovok-na-nedelyu": "/seed-images/articles/plan-trenirovok.png",
  "как-составить-план-тренировок-на-неделю": "/seed-images/articles/plan-trenirovok.png",
  "chto-est-do-i-posle-trenirovki": "/seed-images/articles/pitanie-do-posle.png",
  "что-есть-до-и-после-тренировки": "/seed-images/articles/pitanie-do-posle.png",
  "mobilnost-i-rastyazhka-posle-sidyachego-dnya": "/seed-images/articles/mobilnost-rastyazhka.png",
  "мобильность-и-растяжка-после-сидячего-дня": "/seed-images/articles/mobilnost-rastyazhka.png"
};
const articleImagePool = Object.values(articleImages);

function articleImage(article) {
  const keys = [article?.slug, article?.title, article?.id].map(normalizeKey).filter(Boolean);
  for (const key of keys) if (articleImages[key]) return articleImages[key];
  if (!isBadImage(article?.cover_image_url)) return article.cover_image_url;
  if (!isBadImage(article?.image_url)) return article.image_url;
  return articleImagePool[Math.abs(Number(article?.id || 0)) % articleImagePool.length];
}


export default function ArticleCard({ article, featured = false }) {
  const authorName = article?.author?.name || "Редакция НашФит";
  const trainer = article?.is_trainer_article || article?.author?.is_trainer;
  const image = articleImage(article);

  return (
    <Link
      href={`/articles/${article.id}`}
      className={`group overflow-hidden rounded-[26px] border bg-[color:var(--panel)] shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-1 hover:border-[color:var(--stroke-strong)] hover:shadow-[var(--shadow-md)] ${
        trainer ? "border-[color:var(--accent-border)]" : "border-[color:var(--stroke)]"
      } ${featured ? "grid min-h-[430px] lg:grid-cols-[1.15fr_.85fr]" : "flex h-full flex-col"}`}
    >
      <div className={`relative overflow-hidden ${featured ? "min-h-[280px]" : "aspect-[16/10]"}`}>
        {image ? (
          <img src={image} alt={article.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" onError={(event) => { event.currentTarget.src = articleImage(article); }} />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <span className="absolute left-5 top-5 rounded-full border border-white/30 bg-black/35 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">{categoryLabel(article.category)}</span>
        {trainer ? (
          <span className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-3 py-1.5 text-xs font-black text-[color:var(--on-accent)] shadow-lg">
            <BadgeCheck className="h-4 w-4" /> Материал тренера
          </span>
        ) : null}
      </div>

      <div className={`flex flex-1 flex-col ${featured ? "p-7 lg:p-9" : "p-5"}`}>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-[color:var(--muted)]">
          <span>{articleDate(article.published_at || article.created_at)}</span>
          <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {article.reading_time_minutes || 1} мин</span>
        </div>
        <h2 className={`${featured ? "text-3xl lg:text-4xl" : "text-xl"} font-black leading-tight tracking-[-0.04em] text-[color:var(--text)] transition group-hover:text-[color:var(--accent)]`}>{article.title}</h2>
        <p className={`mt-3 text-[color:var(--muted)] ${featured ? "text-base leading-7" : "line-clamp-3 text-sm leading-6"}`}>{article.excerpt || "Полезный материал о тренировках, здоровье и восстановлении."}</p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[color:var(--stroke)] pt-5 mt-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[color:var(--text)]">{authorName}</p>
            <p className={`truncate text-xs ${trainer ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]"}`}>{trainer && article?.author?.trainer?.specialization ? article.author.trainer.specialization : "Автор НашФит"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs text-[color:var(--muted)]">
            <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {article.views_count || 0}</span>
            <Bookmark className={`h-4 w-4 ${article.is_favorited ? "fill-[color:var(--accent)] text-[color:var(--accent)]" : ""}`} />
          </div>
        </div>
      </div>
    </Link>
  );
}

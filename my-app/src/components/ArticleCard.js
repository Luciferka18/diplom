export function ArticleCard({ article }) {
  return (
    <a
      href={`/blog/${article.slug}`}
      className="card hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between"
    >
      <div>
        <span className="text-xs uppercase tracking-wide text-black/50 mb-2 block">
          {article.category}
        </span>
        <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
        <p className="text-sm text-black/60 line-clamp-3">{article.excerpt}</p>
      </div>
      <div className="mt-4 flex justify-between items-center text-xs text-[var(--color-primary)] font-medium">
        <span>Читать статью</span>
        <span>→</span>
      </div>
    </a>
  );
}



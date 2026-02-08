import { ArticleCard } from "../../components/ArticleCard";
import { apiGet } from "../../services/api";

export default async function BlogPage() {
  const articles = await apiGet("/articles");
  return (
    <div className="py-14">
      <div className="container-fitlab">
        <div className="mb-10">
          <span className="badge mb-3">Блог</span>
          <h1 className="section-title">Статьи о фитнесе и питании</h1>
          <p className="section-subtitle">
            Полезные материалы от тренеров FitLab: питание, программы тренировок,
            восстановление и мотивация. Отлично подходит под SEO.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}


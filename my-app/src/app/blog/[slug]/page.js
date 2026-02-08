import { apiGet } from "../../../services/api";

export default async function ArticlePage({ params }) {
  let article;
  try {
    article = await apiGet(`/articles/${params.slug}`);
  } catch {
    article = null;
  }

  if (!article) {
    return (
      <div className="py-14">
        <div className="container-fitlab">
          <p className="text-sm text-black/60">Статья не найдена.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-14">
      <div className="container-fitlab max-w-3xl">
        <span className="badge mb-3">Статья</span>
        <h1 className="text-3xl font-semibold mb-4">{article.title}</h1>
        <div className="space-y-4 text-sm text-black/75 leading-relaxed">
          <p>{article.content}</p>
        </div>
      </div>
    </div>
  );
}


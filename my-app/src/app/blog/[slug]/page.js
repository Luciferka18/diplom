import { apiGet } from '@/services/api';

export default async function BlogArticlePage({ params }) {
  const resolvedParams =
    params && typeof params.then === 'function' ? await params : params;

  const slug = resolvedParams?.slug;

  if (!slug) {
    return <main className="container-fitlab py-10">Статья не найдена.</main>;
  }

  try {
    // ВАЖНО: бек должен поддерживать получение по slug
    const article = await apiGet(`/articles/slug/${slug}`);

    return (
      <main className="container-fitlab py-10">
        <h1 className="text-3xl font-bold">{article.title}</h1>

        {article.created_at ? (
          <p className="mt-2 text-gray-600">
            {new Date(article.created_at).toLocaleDateString()}
          </p>
        ) : null}

        <div className="mt-6 whitespace-pre-wrap">
          {article.content ?? article.body ?? ''}
        </div>
      </main>
    );
  } catch (e) {
    if (e?.status === 404) {
      return <main className="container-fitlab py-10">Статья не найдена.</main>;
    }
    return <main className="container-fitlab py-10">Ошибка загрузки статьи.</main>;
  }
}

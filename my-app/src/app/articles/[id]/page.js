import { apiGet } from '@/services/api';

export default async function ArticlePage({ params }) {
  const resolvedParams =
    params && typeof params.then === 'function' ? await params : params;

  const id = resolvedParams?.id;

  if (!id) {
    return <main className="container-fitlab py-10">Статья не найдена</main>;
  }

  try {
    const article = await apiGet(`/articles/${id}`);

    return (
      <main className="container-fitlab py-10">
        <h1 className="text-3xl font-bold">{article.title ?? article.name}</h1>

        {article.created_at ? (
          <p className="mt-2 text-gray-600">
            {new Date(article.created_at).toLocaleDateString()}
          </p>
        ) : null}

        {article.content ? (
          <div className="mt-6 whitespace-pre-wrap">{article.content}</div>
        ) : article.body ? (
          <div className="mt-6 whitespace-pre-wrap">{article.body}</div>
        ) : (
          <p className="mt-6 text-gray-600">Контент отсутствует</p>
        )}
      </main>
    );
  } catch (e) {
    if (e?.status === 404) {
      return <main className="container-fitlab py-10">Статья не найдена</main>;
    }
    console.error('[article] load error', e);
    return <main className="container-fitlab py-10">Ошибка загрузки статьи</main>;
  }
}

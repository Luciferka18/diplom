export default function ArticlePage({ params }) {
    return (
      <div>
        <h1>Статья #{params.id}</h1>
        <p>Здесь будет полный текст статьи про тренировки и питание.</p>
      </div>
    );
  }
  
import Link from "next/link";

const articles = [
  { id: 1, title: "Как набрать массу" },
  { id: 2, title: "Лучшие упражнения для спины" },
];

export default function ArticlesPage() {
  return (
    <div>
      <h1>Статьи</h1>
      {articles.map(a => (
        <Link key={a.id} href={`/articles/${a.id}`}>
          <p>{a.title}</p>
        </Link>
      ))}
    </div>
  );
}

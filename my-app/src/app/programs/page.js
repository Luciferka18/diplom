import { apiGet } from "@/services/api";

export default async function ProgramsPage() {
  const data = await apiGet("/programs");

  return (
    <div>
      <h1>Программы тренировок</h1>
      <div className="grid">
        {data.map(p => (
          <Link key={p.id} href={`/programs/${p.id}`}>
            <div className="card">
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { api } from "@/services/api";
import Link from "next/link";

export default async function ProgramsPage() {
  const { data } = await api.get("/programs");

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

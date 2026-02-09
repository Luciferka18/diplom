import Link from "next/link";
import { apiGet } from "@/services/api";

export default async function ProgramsPage() {
  let data = [];
  let backendMissing = false;

  try {
    data = await apiGet("/programs");
  } catch {
    backendMissing = true;
  }

  return (
    <div>
      <h1>Программы тренировок</h1>
      {backendMissing && <p>Not implemented on backend</p>}
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

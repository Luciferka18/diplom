import { apiGet } from "@/services/api";

export default async function ProgramPage({ params }) {
  const program = await apiGet(`/programs/${params.id}`);

  return (
    <main className="container-fitlab py-10">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-2 text-xs text-black/60">
          <span>{program.level}</span>
          {program.duration_weeks && <span>{program.duration_weeks} нед.</span>}
        </div>
        <h1 className="text-3xl font-bold mb-3">{program.title}</h1>
        <p className="text-black/70 mb-4">{program.description}</p>
      </div>
    </main>
  );
}

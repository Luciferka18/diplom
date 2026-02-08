import { apiGet } from "@/services/api";

export default async function TrainerPage({ params }) {
  const trainer = await apiGet(`/trainers/${params.id}`);

  return (
    <main className="container-fitlab py-10">
      <h1 className="text-3xl font-bold">{trainer.name}</h1>
      <p className="mt-2 text-gray-600">{trainer.specialization}</p>
      <p className="mt-4">{trainer.bio}</p>
    </main>
  );
}

import { apiGet } from '@/services/api';

export default async function TrainerPage({ params }) {
  let trainer = null;

  try {
    trainer = await apiGet(`/trainers/${params.id}`);
  } catch {
    trainer = null;
  }

  if (!trainer) {
    return <main className="container-fitlab py-10">Not implemented on backend</main>;
  }

  return (
    <main className="container-fitlab py-10">
      <h1 className="text-3xl font-bold">{trainer.name}</h1>
      <p className="mt-2 text-gray-600">{trainer.specialization}</p>
      <p className="mt-4">{trainer.bio}</p>
    </main>
  );
}

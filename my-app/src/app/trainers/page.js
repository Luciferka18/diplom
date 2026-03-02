import { apiGet } from "@/services/api";
import Link from "next/link";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default async function TrainersPage() {
  let trainers = [];

  try {
    trainers = await apiGet("/trainers");
  } catch (e) {
    console.error("[trainers] failed to load list", e);
    trainers = [];
  }

  return (
    <Section
      title="Наши тренеры"
      subtitle="Профессионалы, которые приведут тебя к результату"
    >
      {trainers.length === 0 ? (
        <Card>Тренеры не найдены</Card>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trainers.map((t) => (
            <li key={t.id}>
              <Card className="h-full">
                <div className="flex items-start gap-4">
                  {t.photo_url || t.avatar || t.image ? (
                    <img
                      src={t.photo_url || t.avatar || t.image}
                      alt={t.name}
                      className="h-16 w-16 rounded-xl object-cover border border-[color:var(--stroke)]"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)] flex items-center justify-center text-xl">
                      🧑‍🏫
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-lg">{t.name}</div>
                    <div className="text-sm text-[color:var(--muted)] mt-1">{t.specialization || "Персональный тренер"}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <Button as={Link} href={`/trainers/${t.id}`} variant="outline" className="w-full">Подробнее</Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

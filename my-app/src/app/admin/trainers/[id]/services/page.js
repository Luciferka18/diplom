"use client";

import { useParams } from "next/navigation";
import TrainerServicesEditor from "@/components/trainers/TrainerServicesEditor";

export default function AdminTrainerServicesPage() {
  const params = useParams();
  const trainerId = params?.id;

  return (
    <TrainerServicesEditor
      loadPath={`/admin/trainers/${trainerId}/services`}
      savePath={`/admin/trainers/${trainerId}/services`}
      title="Услуги тренера"
      subtitle="администратор может включать, отключать и редактировать услуги для записи"
      backHref="/admin/trainers"
      backLabel="К списку тренеров"
    />
  );
}

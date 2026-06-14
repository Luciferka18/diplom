"use client";

import { useParams } from "next/navigation";
import AdminEntityManager from "@/components/admin/AdminEntityManager";

export default function AdminEntityPage() {
  const params = useParams();
  const rawEntity = Array.isArray(params?.entity) ? params.entity[0] : params?.entity;
  const entity = rawEntity === "blog" ? "articles" : rawEntity === "shop" ? "products" : rawEntity;

  return <AdminEntityManager entity={entity} />;
}

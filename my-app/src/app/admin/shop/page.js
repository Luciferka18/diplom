"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/services/api";
import ProductCard from "@/components/ProductCard";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        const data = await apiGet("/products");
        if (!alive) return;
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.data?.message || e?.message || "Ошибка загрузки товаров");
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="container-fitlab py-10">
      <h1 className="section-title mb-6">Магазин</h1>

      {loading ? (
        <p>Загрузка...</p>
      ) : err ? (
        <p style={{ color: "#ffb4b4" }}>{err}</p>
      ) : products.length === 0 ? (
        <p>Товары не найдены</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}

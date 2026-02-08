import { apiGet } from "@/services/api";
import ProductCard from "@/components/ProductCard";

export default async function ShopPage() {
  const products = await apiGet("/products");

  return (
    <main className="container-fitlab py-10">
      <h1 className="section-title mb-6">Магазин</h1>
      <div className="grid gap-4 md:grid-cols-3 text-sm">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
}

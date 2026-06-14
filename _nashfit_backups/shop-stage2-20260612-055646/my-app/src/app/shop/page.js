import { apiGet } from "@/services/api";
import ProductCard from "@/components/ProductCard";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";

export default async function ShopPage() {
  let products = [];
  let backendMissing = false;

  try {
    products = await apiGet("/products");
  } catch {
    backendMissing = true;
  }

  return (
    <Section title="Магазин" subtitle="Питание, аксессуары и инвентарь для прогресса.">
      {backendMissing ? <Card>Not implemented on backend</Card> : null}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-sm">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </Section>
  );
}

import { apiGet } from "@/services/api";
import { AddToCartButton } from "@/components/AddToCartButton";

export default async function ProductPage({ params }) {
  const product = await apiGet(`/products/${params.id}`);

  return (
    <main className="container-fitlab py-10">
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
        <p className="text-black/70 mb-4">{product.description}</p>
        <div className="text-lg font-semibold mb-4">{product.price} ₽</div>
        <AddToCartButton product={product} />
      </div>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Heart, Star, ShieldCheck, Truck, Store, BadgeCheck, ChevronRight, PackageCheck, CheckCircle2 } from "lucide-react";
import { apiGet, apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";

const money = (value) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));

export default function ProductPage() {
  const params = useParams();
  const { isAuthed } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [variantId, setVariantId] = useState(null);
  const [image, setImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "", advantages: "", disadvantages: "" });
  const [reviewBusy, setReviewBusy] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const [data, reviewData] = await Promise.all([
        apiGet(`/products/${params.id}`),
        apiGet(`/reviews?reviewable_type=product&reviewable_id=${params.id}&limit=50`),
      ]);
      const item = data?.data || data;
      setProduct(item);
      setReviews(reviewData?.data || []);
      const first = item?.variants?.find((row) => Number(row.stock) > 0) || item?.variants?.[0] || null;
      setVariantId(first?.id || null);
      setImage(first?.image_url || item?.image_url || item?.gallery?.[0] || null);
    } catch (e) { setError(e?.message || "Товар не найден."); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (params.id) load(); }, [params.id]);

  const variant = useMemo(() => product?.variants?.find((row) => Number(row.id) === Number(variantId)) || null, [product, variantId]);
  const price = variant?.price ?? product?.price;
  const oldPrice = variant?.old_price ?? product?.old_price;
  const stock = Number(variant?.stock ?? product?.stock ?? 0);
  const gallery = useMemo(() => Array.from(new Set([variant?.image_url, product?.image_url, ...(product?.gallery || [])].filter(Boolean))), [product, variant]);

  async function toggleFavorite() {
    if (!isAuthed) { window.location.href = `/login?next=/shop/${params.id}`; return; }
    const response = await apiPost(`/products/${params.id}/favorite`, {});
    setProduct((current) => ({ ...current, is_favorite: response?.is_favorite }));
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!isAuthed) { window.location.href = `/login?next=/shop/${params.id}`; return; }
    setReviewBusy(true); setError("");
    try {
      await apiPost("/reviews", { ...reviewForm, reviewable_type: "product", reviewable_id: Number(params.id) });
      setReviewForm({ rating: 5, text: "", advantages: "", disadvantages: "" });
      await load();
    } catch (e) { setError(e?.data?.message || e?.message || "Не удалось отправить отзыв."); }
    finally { setReviewBusy(false); }
  }

  if (loading) return <main className="container-fitlab py-12"><div className="h-[650px] animate-pulse rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)]" /></main>;
  if (!product) return <main className="container-fitlab py-16"><div className="rounded-3xl border border-red-400/25 bg-red-400/10 p-8 text-red-200">{error || "Товар не найден."}</div></main>;

  return (
    <main className="min-h-screen bg-[color:var(--bg)] pb-20 pt-8">
      <div className="container-fitlab">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted)]"><Link href="/shop" className="hover:text-emerald-400">Магазин</Link><ChevronRight className="h-4 w-4" /><span>{product.category || "Товар"}</span><ChevronRight className="h-4 w-4" /><span className="text-[color:var(--text)]">{product.name}</span></div>

        <section className="grid gap-7 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 md:p-6">
            <div className="aspect-square overflow-hidden rounded-3xl bg-slate-900">{image ? <img src={image} alt={product.name} className="h-full w-full object-cover" /> : null}</div>
            {gallery.length > 1 ? <div className="mt-4 grid grid-cols-5 gap-3">{gallery.slice(0, 5).map((src) => <button key={src} onClick={() => setImage(src)} className={`aspect-square overflow-hidden rounded-xl border ${image === src ? "border-emerald-400" : "border-[color:var(--stroke)]"}`}><img src={src} alt="" className="h-full w-full object-cover" /></button>)}</div> : null}
          </div>

          <aside className="h-fit rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8 lg:sticky lg:top-24">
            <div className="flex items-start justify-between gap-4">
              <div><div className="text-xs font-black uppercase tracking-[.18em] text-emerald-400">{product.brand || product.category}</div><h1 className="mt-2 text-3xl font-black leading-tight text-[color:var(--text)] md:text-4xl">{product.name}</h1></div>
              <button onClick={toggleFavorite} className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border ${product.is_favorite ? "border-rose-400 bg-rose-400 text-white" : "border-[color:var(--stroke)] text-[color:var(--muted)] hover:text-rose-400"}`}><Heart className={`h-5 w-5 ${product.is_favorite ? "fill-current" : ""}`} /></button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[color:var(--muted)]"><span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {Number(product.rating || 0).toFixed(1)}</span><a href="#reviews" className="hover:text-emerald-400">{product.reviews_count || reviews.length} отзывов</a><span>Артикул: {variant?.sku || product.sku || `NF-${product.id}`}</span></div>
            <p className="mt-5 text-base leading-7 text-[color:var(--muted)]">{product.short_description || product.description}</p>

            {product.variants?.length ? <div className="mt-6"><div className="mb-3 text-sm font-bold text-[color:var(--text)]">Выберите вариант</div><div className="grid gap-2 sm:grid-cols-2">{product.variants.map((item) => <button key={item.id} disabled={!item.stock} onClick={() => { setVariantId(item.id); setImage(item.image_url || product.image_url); setQuantity(1); }} className={`rounded-xl border px-4 py-3 text-left transition ${Number(variantId) === Number(item.id) ? "border-emerald-400 bg-emerald-400/10" : "border-[color:var(--stroke)] hover:border-emerald-400/40"} ${!item.stock ? "opacity-40" : ""}`}><div className="font-bold text-[color:var(--text)]">{item.name}</div><div className="mt-1 text-xs text-[color:var(--muted)]">{item.stock ? `${item.stock} шт. в наличии` : "Нет в наличии"}</div></button>)}</div></div> : null}

            <div className="mt-7 flex items-end gap-3"><div className="text-4xl font-black text-[color:var(--text)]">{money(price)}</div>{oldPrice ? <div className="pb-1 text-lg text-[color:var(--muted)] line-through">{money(oldPrice)}</div> : null}</div>
            <div className="mt-5 flex gap-3"><div className="flex items-center rounded-xl border border-[color:var(--stroke)]"><button onClick={() => setQuantity((v) => Math.max(1, v - 1))} className="h-12 w-12 text-xl text-[color:var(--text)]">−</button><span className="w-10 text-center font-bold text-[color:var(--text)]">{quantity}</span><button onClick={() => setQuantity((v) => Math.min(stock, v + 1))} className="h-12 w-12 text-xl text-[color:var(--text)]">+</button></div><AddToCartButton product={product} variant={variant} quantity={quantity} className="h-12 flex-1" /></div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-xl border border-[color:var(--stroke)] p-3 text-sm text-[color:var(--muted)]"><PackageCheck className="mb-2 h-5 w-5 text-emerald-400" /> {stock > 0 ? `В наличии: ${stock}` : "Нет в наличии"}</div>
              <div className="rounded-xl border border-[color:var(--stroke)] p-3 text-sm text-[color:var(--muted)]"><Truck className="mb-2 h-5 w-5 text-cyan-400" /> Бесплатно от 5 000 ₽</div>
              <div className="rounded-xl border border-[color:var(--stroke)] p-3 text-sm text-[color:var(--muted)]"><Store className="mb-2 h-5 w-5 text-violet-400" /> Самовывоз из клуба</div>
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <article className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8"><h2 className="text-2xl font-black text-[color:var(--text)]">О товаре</h2><p className="mt-4 whitespace-pre-line leading-8 text-[color:var(--muted)]">{product.description}</p>{Object.keys(product.attributes || {}).length ? <div className="mt-7 grid gap-3 sm:grid-cols-2">{Object.entries(product.attributes).map(([key,value]) => <div key={key} className="flex justify-between gap-4 border-b border-[color:var(--stroke)] py-3 text-sm"><span className="text-[color:var(--muted)]">{key}</span><b className="text-right text-[color:var(--text)]">{value}</b></div>)}</div> : null}</article>
          <aside className="space-y-4">{product.trainer_recommendations?.map((trainer) => <Link key={trainer.id} href={`/trainers/${trainer.id}`} className="block rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-5"><div className="flex items-center gap-3">{trainer.photo_url ? <img src={trainer.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="h-12 w-12 rounded-full bg-cyan-400/20" />}<div><div className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-cyan-300"><BadgeCheck className="h-4 w-4" /> Рекомендует тренер</div><div className="mt-1 font-black text-[color:var(--text)]">{trainer.name}</div></div></div><p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{trainer.comment}</p></Link>)}</aside>
        </section>

        <section id="reviews" className="mt-8 rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]"><div><h2 className="text-2xl font-black text-[color:var(--text)]">Отзывы покупателей</h2><div className="mt-5 space-y-4">{reviews.length ? reviews.map((review) => <article key={review.id} className="rounded-2xl border border-[color:var(--stroke)] p-5"><div className="flex flex-wrap items-center gap-3"><b className="text-[color:var(--text)]">{review.user?.name || review.user?.login || "Пользователь"}</b><span className="flex gap-0.5">{Array.from({length:5}).map((_,i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-[color:var(--stroke)]"}`} />)}</span>{review.verified_purchase ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> Покупка подтверждена</span> : null}{review.trainer_recommendation ? <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-xs font-bold text-cyan-300">Тренер</span> : null}</div><p className="mt-3 leading-7 text-[color:var(--muted)]">{review.text}</p>{review.advantages ? <p className="mt-3 text-sm"><b className="text-emerald-400">Достоинства:</b> <span className="text-[color:var(--muted)]">{review.advantages}</span></p> : null}{review.disadvantages ? <p className="mt-2 text-sm"><b className="text-rose-400">Недостатки:</b> <span className="text-[color:var(--muted)]">{review.disadvantages}</span></p> : null}</article>) : <div className="rounded-2xl border border-dashed border-[color:var(--stroke)] p-8 text-center text-[color:var(--muted)]">Пока нет отзывов. Расскажите о товаре первым.</div>}</div></div>
            <form onSubmit={submitReview} className="h-fit rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-5"><h3 className="font-black text-[color:var(--text)]">Оставить отзыв</h3><div className="mt-4 flex gap-1">{[1,2,3,4,5].map((n) => <button type="button" key={n} onClick={() => setReviewForm((f) => ({...f,rating:n}))}><Star className={`h-7 w-7 ${n <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-[color:var(--stroke)]"}`} /></button>)}</div><textarea required value={reviewForm.text} onChange={(e) => setReviewForm((f) => ({...f,text:e.target.value}))} placeholder="Ваши впечатления" className="mt-4 min-h-28 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3 text-[color:var(--text)] outline-none focus:border-emerald-400" /><input value={reviewForm.advantages} onChange={(e) => setReviewForm((f) => ({...f,advantages:e.target.value}))} placeholder="Достоинства" className="mt-3 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] outline-none" /><input value={reviewForm.disadvantages} onChange={(e) => setReviewForm((f) => ({...f,disadvantages:e.target.value}))} placeholder="Недостатки" className="mt-3 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] outline-none" />{error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}<button disabled={reviewBusy} className="mt-4 w-full rounded-xl bg-emerald-400 px-4 py-3 font-black text-slate-950 disabled:opacity-50">{reviewBusy ? "Отправляем…" : isAuthed ? "Опубликовать отзыв" : "Войти и оставить отзыв"}</button></form></div>
        </section>

        {product.related_products?.length ? <section className="mt-12"><div className="text-xs font-black uppercase tracking-wider text-emerald-400">Рекомендации</div><h2 className="mt-1 text-3xl font-black text-[color:var(--text)]">С этим часто покупают</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{product.related_products.map((item) => <ProductCard key={item.id} product={{...item, stock: 1, in_stock: true, variants: []}} compact />)}</div></section> : null}
      </div>
    </main>
  );
}

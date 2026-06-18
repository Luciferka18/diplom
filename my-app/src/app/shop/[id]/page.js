"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { apiGet, apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import AddToCartButton from "@/components/AddToCartButton";

function unwrap(response) {
  return response?.data ?? response ?? null;
}

function listFrom(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}


function normalizeKey(value) {
  return String(value || "").toLowerCase().trim().replace(/ё/g, "е").replace(/й/g, "и").replace(/[^a-zа-я0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function isBadImage(value) {
  const path = String(value || "").toLowerCase();
  return !path || path.includes("/demo/") || path.includes("placeholder") || path.includes("gradient") || path.endsWith(".svg");
}

const productImageFallbacks = {
  "whey-protein-gold-standard": "/seed-images/products/whey-protein-gold-standard/main.png",
  "casein-protein": "/seed-images/products/casein-protein/main.png",
  "mass-gainer-pro": "/seed-images/products/mass-gainer-pro/main.png",
  "bcaa-5000": "/seed-images/products/bcaa-5000/main.png",
  "l-glutamine": "/seed-images/products/l-glutamine/main.png",
  "omega-3-ultra": "/seed-images/products/omega-3-ultra/main.png",
  "multivitamin-sport": "/seed-images/products/multivitamin-sport/main.png",
  "rezinovyy-espander": "/seed-images/products/rezinovyy-espander/main.png",
  "kovrik-dlya-yogi": "/seed-images/products/kovrik-dlya-yogi/main.png",
  "butylka-dlya-vody-1l": "/seed-images/products/butylka-dlya-vody-1l/main.png",
  "magniy-recovery": "/seed-images/products/magniy-recovery/main.png",
  "preworkout-focus": "/seed-images/products/preworkout-focus/main.png",
  "protein-bars-12": "/seed-images/products/protein-bars-12/main.png",
  "creatine-monohydrate": "/seed-images/products/creatine-monohydrate/main.png",
  "магнии-recovery": "/seed-images/products/magniy-recovery/main.png",
  "предтренировочныи-комплекс-focus": "/seed-images/products/preworkout-focus/main.png",
  "протеиновые-батончики-12-шт": "/seed-images/products/protein-bars-12/main.png",
  "креатин-моногидрат": "/seed-images/products/creatine-monohydrate/main.png"
};

function mappedProductImage(product) {
  const keys = [product?.slug, product?.name, product?.title, product?.id].map(normalizeKey).filter(Boolean);
  for (const key of keys) if (productImageFallbacks[key]) return productImageFallbacks[key];
  return null;
}

function firstGoodImage(values = []) {
  return values.find((value) => !isBadImage(value)) || null;
}

function money(value) {
  const number = Number(value || 0);
  if (!number) return "—";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(number);
}

function ratingFrom(product, reviews) {
  const direct = Number(product?.avg_rating || product?.rating || 0);
  if (direct) return direct.toFixed(1);
  const rows = Array.isArray(reviews) ? reviews.filter((item) => Number(item.rating)) : [];
  if (!rows.length) return "5.0";
  return (rows.reduce((sum, item) => sum + Number(item.rating || 0), 0) / rows.length).toFixed(1);
}

function safeImage(product, variant) {
  return mappedProductImage(product)
    || firstGoodImage([variant?.image_url, product?.image_url, product?.cover_image_url, ...(Array.isArray(product?.gallery) ? product.gallery : [])])
    || "/seed-images/products/whey-protein-gold-standard/main.png";
}

function Gallery({ product, variant, selectedImage, setSelectedImage }) {
  const gallery = useMemo(() => {
    const values = [safeImage(product, variant), variant?.image_url, product?.image_url, product?.cover_image_url, ...(Array.isArray(product?.gallery) ? product.gallery : [])]
      .filter((value) => !isBadImage(value));
    return Array.from(new Set(values));
  }, [product, variant]);

  const image = selectedImage || safeImage(product, variant);

  return (
    <section className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 shadow-sm">
      <div className="relative aspect-square overflow-hidden rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--bg)]">
        {image ? (
          <img src={image} alt={product?.name || "Товар"} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = mappedProductImage(product) || "/seed-images/products/whey-protein-gold-standard/main.png"; }} />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-emerald-500/14 via-cyan-500/10 to-transparent">
            <ShoppingBag className="h-20 w-20 text-emerald-700/70 dark:text-emerald-300/75" />
          </div>
        )}
        {product?.old_price || variant?.old_price ? (
          <div className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg">
            скидка
          </div>
        ) : null}
      </div>

      {gallery.length > 1 ? (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {gallery.slice(0, 5).map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setSelectedImage(src)}
              className={`aspect-square overflow-hidden rounded-2xl border bg-[color:var(--bg)] transition ${image === src ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-[color:var(--stroke)] hover:border-emerald-500/45"}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function DetailPill({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
      <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
      <div className="mt-3 font-black text-[color:var(--text)]">{title}</div>
      <div className="mt-1 text-sm leading-5 text-[color:var(--muted)]">{text}</div>
    </div>
  );
}

function RelatedCard({ product }) {
  const image = safeImage(product, null);
  return (
    <Link href={`/shop/${product.id}`} className="group rounded-[1.5rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3 transition hover:-translate-y-0.5 hover:border-emerald-500/35 hover:shadow-xl hover:shadow-emerald-950/10">
      <div className="aspect-square overflow-hidden rounded-2xl bg-[color:var(--bg)]">
        {image ? <img src={image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full w-full place-items-center"><ShoppingBag className="h-8 w-8 text-emerald-700 dark:text-emerald-300" /></div>}
      </div>
      <div className="mt-3 line-clamp-2 font-black text-[color:var(--text)] group-hover:text-emerald-700 dark:group-hover:text-emerald-300">{product.name}</div>
      <div className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">{money(product.price)}</div>
    </Link>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { isAuthed } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [variantId, setVariantId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [productRes, reviewsRes, relatedRes] = await Promise.allSettled([
          apiGet(`/products/${id}`),
          apiGet(`/reviews?reviewable_type=product&reviewable_id=${id}&limit=20`),
          apiGet("/products?per_page=8"),
        ]);

        if (cancelled) return;

        if (productRes.status !== "fulfilled") throw productRes.reason;
        const loadedProduct = unwrap(productRes.value);
        const loadedReviews = reviewsRes.status === "fulfilled" ? listFrom(reviewsRes.value) : [];
        const relatedItems = relatedRes.status === "fulfilled" ? listFrom(relatedRes.value).filter((item) => Number(item.id) !== Number(id)).slice(0, 4) : [];
        const firstVariant = loadedProduct?.variants?.find((row) => Number(row.stock) > 0) || loadedProduct?.variants?.[0] || null;

        setProduct(loadedProduct);
        setReviews(loadedReviews);
        setRelated(relatedItems);
        setVariantId(firstVariant?.id || null);
        setSelectedImage(safeImage(loadedProduct, firstVariant));
      } catch (requestError) {
        if (!cancelled) setError(requestError?.message || "Не удалось загрузить товар.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const variant = useMemo(() => product?.variants?.find((row) => Number(row.id) === Number(variantId)) || null, [product, variantId]);
  const price = variant?.price ?? product?.price;
  const oldPrice = variant?.old_price ?? product?.old_price;
  const stock = Number(variant?.stock ?? product?.stock ?? 0);
  const rating = ratingFrom(product, reviews);
  const discount = oldPrice && Number(oldPrice) > Number(price) ? Math.round((1 - Number(price) / Number(oldPrice)) * 100) : 0;

  useEffect(() => {
    const next = safeImage(product, variant);
    if (next) setSelectedImage(next);
  }, [variantId]);

  async function toggleFavorite() {
    if (!isAuthed) {
      window.location.href = `/login?next=/shop/${id}`;
      return;
    }

    setFavoriteBusy(true);
    try {
      const response = await apiPost(`/products/${id}/favorite`, {});
      setProduct((current) => ({ ...current, is_favorite: response?.is_favorite ?? !current?.is_favorite }));
    } finally {
      setFavoriteBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[color:var(--bg)] py-10">
        <div className="container-fitlab grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div className="h-[560px] animate-pulse rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)]" />
          <div className="h-[560px] animate-pulse rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)]" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[color:var(--bg)] py-12">
        <div className="container-fitlab rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-red-700 dark:text-red-200">
          {error || "Товар не найден."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[color:var(--bg)] pb-20 pt-8">
      <div className="container-fitlab">
        <Link href="/shop" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--muted)] transition hover:text-emerald-700 dark:hover:text-emerald-300">
          <ArrowLeft className="h-4 w-4" /> В магазин
        </Link>

        <section className="grid gap-7 lg:grid-cols-[1.05fr_.95fr]">
          <Gallery product={product} variant={variant} selectedImage={selectedImage} setSelectedImage={setSelectedImage} />

          <aside className="h-fit rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 shadow-sm md:p-8 lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                {product.brand || product.category?.name || product.category || "НашФит"}
              </span>
              {stock > 0 ? <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-700 dark:text-cyan-300">в наличии</span> : <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-black text-rose-700 dark:text-rose-300">нет в наличии</span>}
            </div>

            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black leading-tight text-[color:var(--text)] md:text-5xl">{product.name}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[color:var(--muted)]">
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300"><Star className="h-4 w-4 fill-current" /> {rating}</span>
                  <span>{reviews.length} отзывов</span>
                  <span>артикул: {variant?.sku || product.sku || `NF-${product.id}`}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={favoriteBusy}
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition ${product.is_favorite ? "border-rose-500 bg-rose-500 text-white" : "border-[color:var(--stroke)] bg-[color:var(--bg)] text-[color:var(--muted)] hover:text-rose-600 dark:hover:text-rose-300"}`}
                aria-label="В избранное"
              >
                <Heart className={`h-5 w-5 ${product.is_favorite ? "fill-current" : ""}`} />
              </button>
            </div>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)]">{product.short_description || product.description || "Качественный товар для тренировок, восстановления и прогресса в НашФит."}</p>

            <div className="mt-6 rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-5">
              <div className="flex flex-wrap items-end gap-3">
                <div className="text-4xl font-black text-[color:var(--text)]">{money(price)}</div>
                {oldPrice && Number(oldPrice) > Number(price) ? <div className="pb-1 text-lg font-bold text-[color:var(--muted)] line-through">{money(oldPrice)}</div> : null}
                {discount ? <div className="mb-1 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-black text-rose-700 dark:text-rose-300">-{discount}%</div> : null}
              </div>
            </div>

            {Array.isArray(product.variants) && product.variants.length ? (
              <div className="mt-6">
                <div className="text-sm font-black text-[color:var(--text)]">Вариант</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {product.variants.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setVariantId(item.id)}
                      className={`rounded-2xl border p-3 text-left transition ${Number(variantId) === Number(item.id) ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200" : "border-[color:var(--stroke)] bg-[color:var(--bg)] text-[color:var(--text)] hover:border-emerald-500/40"}`}
                    >
                      <div className="font-black">{item.name}</div>
                      <div className="mt-1 text-xs text-[color:var(--muted)]">{money(item.price ?? product.price)} · остаток {Number(item.stock || 0)}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-1">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-[color:var(--panel)]"><Minus className="h-4 w-4" /></button>
                <div className="w-10 text-center font-black text-[color:var(--text)]">{quantity}</div>
                <button type="button" onClick={() => setQuantity((value) => Math.min(99, value + 1))} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-[color:var(--panel)]"><Plus className="h-4 w-4" /></button>
              </div>
              <AddToCartButton product={product} variant={variant} quantity={quantity} className="min-h-12 flex-1 rounded-2xl px-6 text-base" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <DetailPill icon={Truck} title="Доставка" text="Самовывоз или доставка" />
              <DetailPill icon={ShieldCheck} title="Качество" text="Проверено клубом" />
              <DetailPill icon={PackageCheck} title="Остаток" text={`${stock} шт.`} />
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_.8fr]">
          <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300"><Sparkles className="h-4 w-4" /> О товаре</div>
            <h2 className="mt-4 text-2xl font-black text-[color:var(--text)]">Почему стоит выбрать</h2>
            <p className="mt-3 text-base leading-8 text-[color:var(--muted)]">{product.description || product.short_description || "Подходит для регулярных тренировок, домашних занятий и восстановления после нагрузки."}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Подходит для тренировок дома и в зале", "Можно сочетать с бесплатными программами", "Хороший выбор для стабильного прогресса", "Добавляется в корзину без перезагрузки страницы"].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-[color:var(--bg)] p-4 text-sm font-semibold text-[color:var(--text)]"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" /> {item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-[color:var(--text)]">Отзывы</h2>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Рейтинг {rating} · {reviews.length} отзывов</p>
              </div>
              <BadgeCheck className="h-8 w-8 text-emerald-700 dark:text-emerald-300" />
            </div>
            <div className="mt-5 space-y-3">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                  <div className="flex items-center justify-between gap-3"><div className="font-black text-[color:var(--text)]">{review.user?.name || review.author_name || "Покупатель"}</div><div className="inline-flex items-center gap-1 text-sm font-black text-amber-700 dark:text-amber-300"><Star className="h-4 w-4 fill-current" /> {review.rating || 5}</div></div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">{review.text || review.body || "Отличный товар."}</p>
                </div>
              ))}
              {!reviews.length ? <div className="rounded-2xl border border-dashed border-[color:var(--stroke)] bg-[color:var(--bg)] p-5 text-sm text-[color:var(--muted)]">Отзывов пока нет. После покупки пользователь сможет оставить оценку.</div> : null}
            </div>
          </div>
        </section>

        {related.length ? (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><h2 className="text-2xl font-black text-[color:var(--text)]">Похожие товары</h2><p className="text-sm text-[color:var(--muted)]">Подборка для продолжения покупки</p></div>
              <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">Все товары <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <RelatedCard key={item.id} product={item} />)}</div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

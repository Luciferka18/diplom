"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, Star, BadgeCheck, PackageCheck } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const money = (value) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));

export default function ProductCard({ product, compact = false }) {
  const { isAuthed } = useAuth();
  const [favorite, setFavorite] = useState(Boolean(product.is_favorite));
  const variants = Array.isArray(product.variants) ? product.variants.filter((item) => item.is_active !== false) : [];
  const defaultVariant = useMemo(() => variants.find((item) => Number(item.stock) > 0) || variants[0] || null, [variants]);
  const currentPrice = defaultVariant?.price ?? product.price;
  const oldPrice = defaultVariant?.old_price ?? product.old_price;
  const image = defaultVariant?.image_url || product.image_url || product.gallery?.[0];

  async function toggleFavorite(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthed) {
      window.location.href = `/login?next=/shop/${product.id}`;
      return;
    }
    const response = await apiPost(`/products/${product.id}/favorite`, {});
    setFavorite(Boolean(response?.is_favorite));
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-950/10">
      <Link href={`/shop/${product.id}`} className={`relative block overflow-hidden bg-slate-900 ${compact ? "aspect-[5/4]" : "aspect-square"}`}>
        {image ? <img src={image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="h-full w-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/5" />}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/75 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.trainer_pick ? <span className="inline-flex items-center gap-1 rounded-full bg-cyan-300 px-2.5 py-1 text-[11px] font-black text-slate-950"><BadgeCheck className="h-3.5 w-3.5" /> Выбор тренера</span> : null}
          {product.is_new ? <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-[11px] font-black text-slate-950">Новинка</span> : null}
          {!product.in_stock ? <span className="rounded-full bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-white">Нет в наличии</span> : null}
        </div>
      </Link>

      <button onClick={toggleFavorite} aria-label="В избранное" className={`absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border backdrop-blur transition ${favorite ? "border-rose-400/40 bg-rose-400 text-white" : "border-white/15 bg-slate-950/55 text-white hover:bg-slate-950/80"}`}>
        <Heart className={`h-5 w-5 ${favorite ? "fill-current" : ""}`} />
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">{product.brand || product.category || "НашФит"}</div>
        <Link href={`/shop/${product.id}`} className="mt-2 text-lg font-black leading-snug text-[color:var(--text)] hover:text-emerald-400">{product.name}</Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{product.short_description || product.description}</p>

        <div className="mt-4 flex items-center gap-3 text-xs text-[color:var(--muted)]">
          <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {Number(product.rating || 0).toFixed(1)}</span>
          <span>{product.reviews_count || 0} отзывов</span>
          <span className="ml-auto inline-flex items-center gap-1"><PackageCheck className="h-4 w-4" /> {product.stock || 0} шт.</span>
        </div>

        {variants.length > 1 ? <div className="mt-3 text-xs text-[color:var(--muted)]">{variants.length} варианта · от {money(Math.min(...variants.map((item) => Number(item.price || product.price))))}</div> : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <div className="text-xl font-black text-[color:var(--text)]">{money(currentPrice)}</div>
            {oldPrice ? <div className="text-xs text-[color:var(--muted)] line-through">{money(oldPrice)}</div> : null}
          </div>
          <AddToCartButton product={product} variant={defaultVariant} />
        </div>
      </div>
    </article>
  );
}

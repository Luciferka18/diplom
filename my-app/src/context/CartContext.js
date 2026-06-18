"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";

const CartContext = createContext(null);
const LS_KEY = "nashfit_cart_v2";

function safeParse(value, fallback = []) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function itemKey(productId, variantId) {
  return `${productId}:${variantId || "base"}`;
}

function normalizeCart(payload) {
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
  return rows.map((row) => {
    const product = row.product || row;
    const variant = row.variant || null;
    const productId = Number(row.product_id ?? product.id ?? row.id);
    const variantId = row.variant_id ?? row.product_variant_id ?? variant?.id ?? null;
    return {
      key: itemKey(productId, variantId),
      id: productId,
      productId,
      variantId: variantId ? Number(variantId) : null,
      cartItemId: row.cart_item_id ?? row.id ?? null,
      name: product.name ?? product.title ?? row.name ?? "Товар",
      title: product.name ?? product.title ?? row.name ?? "Товар",
      brand: product.brand ?? "",
      category: product.category ?? "",
      image_url: product.image_url ?? row.image_url ?? null,
      photo_url: product.image_url ?? row.image_url ?? null,
      price: Number(row.price ?? row.price_snapshot ?? product.price ?? 0),
      quantity: Number(row.quantity ?? row.qty ?? 1),
      stock: Number(variant?.stock ?? product.stock ?? 0),
      variant: variant ? { ...variant, id: Number(variant.id) } : null,
    };
  });
}

export function CartProvider({ children }) {
  const { isAuthed } = useAuth();
  const [cart, setCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem(LS_KEY) || localStorage.getItem("cart")) : null;
    if (saved) setCart(normalizeCart(safeParse(saved)));
    setLoadingCart(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(LS_KEY, JSON.stringify(cart));
  }, [cart]);

  const refreshCart = useCallback(async () => {
    if (!isAuthed) return;
    const data = await apiGet("/cart");
    setCart(normalizeCart(data));
  }, [isAuthed]);

  useEffect(() => {
    if (!isAuthed) return;
    let cancelled = false;
    (async () => {
      setLoadingCart(true);
      try {
        const data = await apiGet("/cart");
        const server = normalizeCart(data);
        if (!server.length && cart.length) {
          for (const item of cart) {
            await apiPost("/cart/items", {
              product_id: item.productId || item.id,
              variant_id: item.variantId || null,
              quantity: item.quantity,
            });
          }
          const synced = await apiGet("/cart");
          if (!cancelled) setCart(normalizeCart(synced));
        } else if (!cancelled) setCart(server);
      } catch (error) {
        console.warn("Cart sync failed", error);
      } finally {
        if (!cancelled) setLoadingCart(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  const addToCart = useCallback(async (product, variant = null, quantity = 1) => {
    const productId = Number(product.id);
    const variantId = variant?.id ? Number(variant.id) : null;
    const key = itemKey(productId, variantId);
    const price = Number(variant?.price ?? product.price ?? 0);
    const stock = Number(variant?.stock ?? product.stock ?? 0);
    const qty = Math.max(1, Number(quantity || 1));
    if (stock <= 0) throw new Error("Товар закончился.");

    if (!isAuthed) {
      setCart((current) => {
        const found = current.find((item) => item.key === key);
        if (found) return current.map((item) => item.key === key ? { ...item, quantity: Math.min(stock, item.quantity + qty) } : item);
        return [...current, {
          key, id: productId, productId, variantId, cartItemId: null,
          name: product.name || product.title, title: product.name || product.title,
          brand: product.brand || "", image_url: variant?.image_url || product.image_url || null,
          photo_url: variant?.image_url || product.image_url || null, price, quantity: Math.min(stock, qty), stock,
          variant: variant ? { ...variant } : null,
        }];
      });
    } else {
      const response = await apiPost("/cart/items", { product_id: productId, variant_id: variantId, quantity: qty });
      setCart(normalizeCart(response));
    }
    setLastAdded({ product, variant, at: Date.now() });
  }, [isAuthed]);

  const setQuantity = useCallback(async (keyOrId, quantity) => {
    const item = cart.find((row) => row.key === keyOrId || row.id === keyOrId);
    if (!item) return;
    const next = Math.max(1, Math.min(item.stock || 99, Number(quantity || 1)));
    if (!isAuthed) setCart((current) => current.map((row) => row.key === item.key ? { ...row, quantity: next } : row));
    else {
      const response = await apiPatch(`/cart/items/${item.cartItemId}`, { quantity: next });
      setCart(normalizeCart(response));
    }
  }, [cart, isAuthed]);

  const removeFromCart = useCallback(async (keyOrId) => {
    const item = cart.find((row) => row.key === keyOrId || row.id === keyOrId);
    if (!item) return;
    if (!isAuthed) setCart((current) => current.filter((row) => row.key !== item.key));
    else {
      const response = await apiDelete(`/cart/items/${item.cartItemId}`);
      setCart(normalizeCart(response));
    }
  }, [cart, isAuthed]);

  const clearLocalCart = useCallback(() => {
    setCart([]);
    setLastAdded(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem("cart");
    }
  }, []);

  const clearCart = useCallback(async () => {
    if (!isAuthed) {
      clearLocalCart();
      return;
    }
    const response = await apiDelete("/cart");
    setCart(normalizeCart(response));
  }, [isAuthed, clearLocalCart]);

  const totalCount = useMemo(() => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0), [cart]);

  return <CartContext.Provider value={{ cart, addToCart, setQuantity, removeFromCart, clearCart, clearLocalCart, refreshCart, totalCount, totalPrice, loadingCart, lastAdded, dismissLastAdded: () => setLastAdded(null) }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

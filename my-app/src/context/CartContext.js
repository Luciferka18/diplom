"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const CartContext = createContext(null);

const LS_KEY = "cart";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Нормализуем ответ /api/cart под единый формат:
 * item: { id: productId, cartItemId, name, title, price, quantity }
 */
function normalizeCart(apiCart) {
  if (!apiCart) return [];

  // варианты: {items: [...]}, {cart: [...]}, просто [...]
  const items = Array.isArray(apiCart)
    ? apiCart
    : Array.isArray(apiCart.items)
      ? apiCart.items
      : Array.isArray(apiCart.cart)
        ? apiCart.cart
        : [];

  return items.map((it) => {
    const product = it.product || it.product_item || it;
    const productId = product.id ?? it.product_id ?? it.id;

    return {
      id: productId, // product id
      cartItemId: it.id ?? it.cart_item_id ?? null, // cart row id
      name: product.name ?? product.title ?? it.name ?? it.title ?? `#${productId}`,
      title: product.title ?? product.name ?? it.title ?? it.name ?? `#${productId}`,
      price: Number(product.price ?? it.price ?? 0),
      quantity: Number(it.quantity ?? it.qty ?? 1),
    };
  });
}

export function CartProvider({ children }) {
  const { isAuthed } = useAuth();

  const [cart, setCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);

  // 1) грузим локальную корзину
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (saved) setCart(safeParse(saved, []));
  }, []);

  // 2) сохраняем локально (всегда — на всякий)
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
  }, [cart]);

  // 3) если залогинен — тянем серверную корзину и мерджим/заливаем локальную
  useEffect(() => {
    if (!isAuthed) return;

    let cancelled = false;

    (async () => {
      setLoadingCart(true);
      try {
        const r = await fetch("/api/cart", { cache: "no-store" });
        const data = await r.json().catch(() => ({}));

        if (!r.ok) throw new Error(data?.message || `Cart load failed (${r.status})`);

        const serverCart = normalizeCart(data);

        // если в серверной пусто, а локально есть — заливаем локальную в сервер
        if (serverCart.length === 0 && cart.length > 0) {
          for (const item of cart) {
            await fetch("/api/cart/items", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                product_id: item.id,
                quantity: item.quantity,
              }),
              cache: "no-store",
            });
          }

          // перезагрузка после залива
          const r2 = await fetch("/api/cart", { cache: "no-store" });
          const data2 = await r2.json().catch(() => ({}));
          if (!r2.ok) throw new Error(data2?.message || `Cart load failed (${r2.status})`);

          if (!cancelled) setCart(normalizeCart(data2));
          return;
        }

        // иначе берём серверную как источник истины
        if (!cancelled) setCart(serverCart);
      } catch {
        // если сервер не ответил — просто оставляем локальную (не роняем сайт)
      } finally {
        if (!cancelled) setLoadingCart(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  async function refreshServerCart() {
    const r = await fetch("/api/cart", { cache: "no-store" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.message || `Cart refresh failed (${r.status})`);
    setCart(normalizeCart(data));
  }

  // --- actions ---
  const addToCart = async (product) => {
    const productId = product.id;
    const price = Number(product.price ?? 0);
    const name = product.name ?? product.title ?? "Товар";

    // гость
    if (!isAuthed) {
      setCart((prev) => {
        const found = prev.find((i) => i.id === productId);
        if (found) return prev.map((i) => (i.id === productId ? { ...i, quantity: i.quantity + 1 } : i));
        return [...prev, { id: productId, cartItemId: null, name, title: name, price, quantity: 1 }];
      });
      return;
    }

    // авторизован → сервер
    await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, quantity: 1 }),
      cache: "no-store",
    });

    await refreshServerCart();
  };

  const setQuantity = async (productId, quantity) => {
    quantity = Math.max(1, Number(quantity || 1));

    if (!isAuthed) {
      setCart((prev) => prev.map((i) => (i.id === productId ? { ...i, quantity } : i)));
      return;
    }

    const item = cart.find((i) => i.id === productId);
    if (!item?.cartItemId) return;

    await fetch(`/api/cart/items/${item.cartItemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
      cache: "no-store",
    });

    await refreshServerCart();
  };

  const removeFromCart = async (productId) => {
    if (!isAuthed) {
      setCart((prev) => prev.filter((i) => i.id !== productId));
      return;
    }

    const item = cart.find((i) => i.id === productId);
    if (!item?.cartItemId) return;

    await fetch(`/api/cart/items/${item.cartItemId}`, {
      method: "DELETE",
      cache: "no-store",
    });

    await refreshServerCart();
  };

  const clearCart = async () => {
    if (!isAuthed) {
      setCart([]);
      return;
    }

    // удаляем все позиции поштучно (API на очистку нет)
    for (const item of cart) {
      if (item.cartItemId) {
        await fetch(`/api/cart/items/${item.cartItemId}`, { method: "DELETE", cache: "no-store" });
      }
    }
    await refreshServerCart();
  };

  const totalCount = useMemo(() => cart.reduce((s, i) => s + Number(i.quantity || 0), 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.price || 0), 0), [cart]);

  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, clearCart, setQuantity, totalCount, totalPrice, loadingCart }),
    [cart, totalCount, totalPrice, loadingCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

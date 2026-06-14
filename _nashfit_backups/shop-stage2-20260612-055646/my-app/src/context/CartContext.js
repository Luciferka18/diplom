"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/services/api";

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
      id: productId,
      cartItemId: it.id ?? it.cart_item_id ?? null,
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

  // 2) сохраняем локально
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
  }, [cart]);

  // 3) если залогинен — тянем серверную корзину и мерджим локальную
  useEffect(() => {
    if (!isAuthed) return;

    let cancelled = false;

    (async () => {
      setLoadingCart(true);

      try {
        const data = await apiGet("/cart");
        const serverCart = normalizeCart(data);

        // если серверная корзина пустая, а локально есть товары — заливаем локальную в сервер
        if (serverCart.length === 0 && cart.length > 0) {
          for (const item of cart) {
            await apiPost("/cart/items", {
              product_id: item.id,
              quantity: item.quantity,
            });
          }

          const data2 = await apiGet("/cart");

          if (!cancelled) {
            setCart(normalizeCart(data2));
          }

          return;
        }

        // иначе берём серверную корзину как источник истины
        if (!cancelled) {
          setCart(serverCart);
        }
      } catch (error) {
        console.warn("Cart load failed:", error);
        // если сервер не ответил — оставляем локальную корзину и не роняем сайт
      } finally {
        if (!cancelled) {
          setLoadingCart(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };

    // cart специально не добавляем в зависимости, чтобы не гонять синхронизацию бесконечно
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  async function refreshServerCart() {
    const data = await apiGet("/cart");
    setCart(normalizeCart(data));
  }

  const addToCart = async (product) => {
    const productId = product.id;
    const price = Number(product.price ?? 0);
    const name = product.name ?? product.title ?? "Товар";

    // гость — храним корзину локально
    if (!isAuthed) {
      setCart((prev) => {
        const found = prev.find((i) => i.id === productId);

        if (found) {
          return prev.map((i) =>
            i.id === productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }

        return [
          ...prev,
          {
            id: productId,
            cartItemId: null,
            name,
            title: name,
            price,
            quantity: 1,
          },
        ];
      });

      return;
    }

    // авторизованный пользователь — отправляем на сервер
    await apiPost("/cart/items", {
      product_id: productId,
      quantity: 1,
    });

    await refreshServerCart();
  };

  const setQuantity = async (productId, quantity) => {
    const nextQuantity = Math.max(1, Number(quantity || 1));

    // гость — меняем локально
    if (!isAuthed) {
      setCart((prev) =>
        prev.map((i) =>
          i.id === productId
            ? { ...i, quantity: nextQuantity }
            : i
        )
      );

      return;
    }

    const item = cart.find((i) => i.id === productId);
    if (!item?.cartItemId) return;

    await apiPatch(`/cart/items/${item.cartItemId}`, {
      quantity: nextQuantity,
    });

    await refreshServerCart();
  };

  const removeFromCart = async (productId) => {
    // гость — удаляем локально
    if (!isAuthed) {
      setCart((prev) => prev.filter((i) => i.id !== productId));
      return;
    }

    const item = cart.find((i) => i.id === productId);
    if (!item?.cartItemId) return;

    await apiDelete(`/cart/items/${item.cartItemId}`);

    await refreshServerCart();
  };

  const clearCart = async () => {
    // гость — очищаем локально
    if (!isAuthed) {
      setCart([]);
      return;
    }

    // API на очистку всей корзины нет, поэтому удаляем позиции поштучно
    for (const item of cart) {
      if (item.cartItemId) {
        await apiDelete(`/cart/items/${item.cartItemId}`);
      }
    }

    await refreshServerCart();
  };

  const totalCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cart]
  );

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0) * Number(item.price || 0),
        0
      ),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      setQuantity,
      totalCount,
      totalPrice,
      loadingCart,
    }),
    [cart, isAuthed, totalCount, totalPrice, loadingCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }

  return ctx;
};
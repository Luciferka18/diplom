"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, setQuantity, totalCount, totalPrice, loadingCart } = useCart();

  if (loadingCart) {
    return (
      <div>
        <h1 className="page-title">Корзина</h1>
        <p className="page-subtitle">Загрузка…</p>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div>
        <h1 className="page-title">Корзина</h1>
        <p className="page-subtitle">Корзина пуста.</p>
        <Link className="btn btn-primary" href="/shop">
          Перейти в магазин
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Корзина</h1>
      <p className="page-subtitle">
        Товаров: <b>{totalCount}</b> • Сумма: <b>{Number(totalPrice).toFixed(2)}</b>
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {cart.map((item) => (
          <div key={item.id} className="card" style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div className="card-title" style={{ marginBottom: 6 }}>
                {item.name}
              </div>
              <div className="card-text">Цена: {Number(item.price).toFixed(2)}</div>

              <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span className="muted">Кол-во:</span>
                <button className="btn" onClick={() => setQuantity(item.id, item.quantity - 1)}>-</button>
                <input
                  className="input"
                  style={{ width: 90 }}
                  value={item.quantity}
                  onChange={(e) => setQuantity(item.id, e.target.value)}
                />
                <button className="btn" onClick={() => setQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
            </div>

            <button className="btn" onClick={() => removeFromCart(item.id)}>
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <button className="btn" onClick={clearCart}>
          Очистить корзину
        </button>
        <Link className="btn btn-primary" href="/shop">
          Продолжить покупки
        </Link>
      </div>
    </div>
  );
}

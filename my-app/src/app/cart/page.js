"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { api } from "@/services/api";

export default function CartPage() {
  const cartState = (typeof useCart === "function" ? useCart() : null) || {};
  const { cart = [], removeFromCart, clearCart, total = 0 } = cartState;
  const [customer, setCustomer] = useState({ customer_name: "", customer_phone: "", customer_email: "" });

  const order = async () => {
    if (!customer.customer_name || !customer.customer_phone) {
      alert("Укажите имя и телефон для оформления заказа");
      return;
    }

    await api.post("/orders", {
      ...customer,
      items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    });
    clearCart();
    alert("Заказ оформлен");
  };

  return (
    <div>
      <h1>Корзина</h1>

      {cart.length === 0 && <p>Корзина пуста</p>}

      {cart.map((i) => (
        <div key={i.id} className="card" style={{ marginBottom: 10 }}>
          <h3>{i.title}</h3>
          <p>Количество: {i.quantity}</p>
          <p>Цена: {i.price * i.quantity} ₽</p>
          <button className="button secondary" onClick={() => removeFromCart(i.id)}>
            Удалить
          </button>
        </div>
      ))}

      {cart.length > 0 && (
        <>
          <h2>Итого: {total} ₽</h2>
          <div className="card" style={{ marginBottom: 10, display: 'grid', gap: 8, maxWidth: 420 }}>
            <input
              placeholder="Ваше имя"
              value={customer.customer_name}
              onChange={(e) => setCustomer((prev) => ({ ...prev, customer_name: e.target.value }))}
            />
            <input
              placeholder="Телефон"
              value={customer.customer_phone}
              onChange={(e) => setCustomer((prev) => ({ ...prev, customer_phone: e.target.value }))}
            />
            <input
              placeholder="Email (необязательно)"
              value={customer.customer_email}
              onChange={(e) => setCustomer((prev) => ({ ...prev, customer_email: e.target.value }))}
            />
          </div>
          <button className="button" onClick={order}>
            Оформить заказ
          </button>
        </>
      )}
    </div>
  );
}

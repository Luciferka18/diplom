"use client";

import { useCart } from "@/context/CartContext";
import { api } from "@/services/api";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = async () => {
    await api.post("/orders", {
      items: cart.map(i => ({ product_id: i.id, quantity: i.quantity }))
    });
    clearCart();
    alert("Заказ оформлен");
  };

  return (
    <div>
      <h1>Корзина</h1>

      {cart.length === 0 && <p>Корзина пуста</p>}

      {cart.map(i => (
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
          <button className="button" onClick={order}>
            Оформить заказ
          </button>
        </>
      )}
    </div>
  );
}

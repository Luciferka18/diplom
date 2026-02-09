"use client";
import { useCart } from "@/context/CartContext";

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, totalPrice } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <aside className="absolute right-0 top-0 h-full w-[360px] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Корзина</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {cart.length === 0 && (
          <p className="text-sm text-black/60">Корзина пуста</p>
        )}

        <div className="space-y-3 mb-6">
          {cart.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-black/60">
                  {item.quantity} × {item.price} ₽
                </p>
              </div>
              <button
                className="text-xs text-black/50 hover:text-black"
                onClick={() => removeFromCart(item.id)}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between font-semibold mb-4">
            <span>Итого</span>
            <span>{totalPrice} ₽</span>
          </div>
          <button className="btn-primary w-full">Оформить заказ</button>
        </div>
      </aside>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../services/api";

function slugify(str) {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-а-яё]/g, "")
    .replace(/-+/g, "-");
}

export default function DashboardProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    price: "",
    description: "",
    image_url: "",
    in_stock: true,
  });
  const [status, setStatus] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    apiGet("/products")
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (field) => (e) => {
    const value =
      field === "in_stock" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const startCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      slug: "",
      category: "",
      price: "",
      description: "",
      image_url: "",
      in_stock: true,
    });
    setStatus(null);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      category: p.category ?? "",
      price: String(p.price),
      description: p.description ?? "",
      image_url: p.image_url ?? "",
      in_stock: !!p.in_stock,
    });
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const payload = {
      ...form,
      price: Number(form.price || 0),
      slug: form.slug || slugify(form.name),
    };
    try {
      if (editingId) {
        await apiPut(`/products/${editingId}`, payload);
        setStatus({ type: "success", message: "Товар обновлён" });
      } else {
        await apiPost("/products", payload);
        setStatus({ type: "success", message: "Товар создан" });
      }
      loadProducts();
    } catch (error) {
      setStatus({
        type: "error",
        message: "Ошибка при сохранении товара",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Удалить товар?")) return;
    setStatus(null);
    try {
      await apiDelete(`/products/${id}`);
      setStatus({ type: "success", message: "Товар удалён" });
      loadProducts();
    } catch {
      setStatus({ type: "error", message: "Не удалось удалить товар" });
    }
  };

  return (
    <div className="py-10">
      <div className="container-fitlab grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h1 className="text-2xl font-semibold mb-2">
            Управление товарами
          </h1>
          <p className="text-sm text-black/60 mb-4">
            Добавляй, редактируй и удаляй товары магазина.
          </p>
          <div className="card text-xs space-y-3 max-h-[480px] overflow-auto">
            {loading && <p>Загрузка...</p>}
            {!loading &&
              products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b border-black/5 pb-2 last:border-none last:pb-0"
                >
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-black/60">
                      {p.category} ·{" "}
                      {p.price.toLocaleString("ru-RU", {
                        style: "currency",
                        currency: "RUB",
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-outline px-3 py-1"
                      onClick={() => startEdit(p)}
                    >
                      Редактировать
                    </button>
                    <button
                      className="btn-outline px-3 py-1"
                      onClick={() => handleDelete(p.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <aside className="card text-xs space-y-3 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">
              {editingId ? "Редактировать товар" : "Добавить товар"}
            </h2>
            <button className="btn-outline px-3 py-1" onClick={startCreate}>
              Новый
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label className="block mb-1">Название</label>
              <input
                type="text"
                className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
            </div>
            <div>
              <label className="block mb-1">Slug (URL)</label>
              <input
                type="text"
                className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                value={form.slug}
                onChange={handleChange("slug")}
                placeholder="syvorotochnyi-protein-1kg"
              />
            </div>
            <div>
              <label className="block mb-1">Категория</label>
              <input
                type="text"
                className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                value={form.category}
                onChange={handleChange("category")}
              />
            </div>
            <div>
              <label className="block mb-1">Цена (₽)</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                value={form.price}
                onChange={handleChange("price")}
                required
              />
            </div>
            <div>
              <label className="block mb-1">Описание</label>
              <textarea
                className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-[var(--color-primary)] min-h-[60px]"
                value={form.description}
                onChange={handleChange("description")}
              />
            </div>
            <div>
              <label className="block mb-1">Изображение (URL)</label>
              <input
                type="text"
                className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                value={form.image_url}
                onChange={handleChange("image_url")}
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.in_stock}
                onChange={handleChange("in_stock")}
              />
              <span>В наличии</span>
            </label>
            <button type="submit" className="btn-primary w-full mt-2">
              {editingId ? "Обновить" : "Создать"}
            </button>
            {status && (
              <p
                className={`text-[11px] ${
                  status.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {status.message}
              </p>
            )}
          </form>
        </aside>
      </div>
    </div>
  );
}



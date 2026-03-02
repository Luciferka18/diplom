"use client";

import { useEffect, useState } from "react";

export default function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr(""); setOk("");
    const r = await fetch("/api/products", { cache: "no-store" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setErr(data?.message || `Ошибка (${r.status})`);
      return;
    }
    setItems(Array.isArray(data) ? data : (data.data ?? []));
  }

  useEffect(() => { load(); }, []);

  function pick(p) {
    setSelected(p);
    setName(p.name ?? p.title ?? "");
    setPrice(String(p.price ?? ""));
    setDescription(p.description ?? "");
    setImageUrl(p.image_url ?? p.image ?? "");
  }

  function resetForm() {
    setSelected(null);
    setName(""); setPrice(""); setDescription(""); setImageUrl("");
  }

  async function save() {
    setBusy(true); setErr(""); setOk("");
    try {
      const payload = {
        name,
        title: name, // на всякий случай
        price: Number(price),
        description,
        image_url: imageUrl,
        image: imageUrl, // на всякий случай
      };

      const url = selected ? `/api/products/${selected.id}` : "/api/products";
      const method = selected ? "PUT" : "POST";

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const details = data?.errors ? JSON.stringify(data.errors) : (data?.message || `Ошибка (${r.status})`);
        throw new Error(details);
      }

      setOk(selected ? "Сохранено ✅" : "Создано ✅");
      await load();
      resetForm();
    } catch (e) {
      setErr(e.message || "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm("Удалить товар?")) return;
    setBusy(true); setErr(""); setOk("");
    try {
      const r = await fetch(`/api/products/${id}`, { method: "DELETE", cache: "no-store" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const details = data?.errors ? JSON.stringify(data.errors) : (data?.message || `Ошибка (${r.status})`);
        throw new Error(details);
      }

      setOk("Удалено ✅");
      await load();
      if (selected?.id === id) resetForm();
    } catch (e) {
      setErr(e.message || "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div>
          <div className="h2">Магазин</div>
          <div className="muted">CRUD через /api/products</div>
        </div>
        <button className="btn" onClick={load} disabled={busy}>Обновить</button>
      </div>

      {err ? <div className="error" style={{ marginTop: 10 }}>{err}</div> : null}
      {ok ? <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "#ecfdf5", border: "1px solid #a7f3d0" }}>{ok}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, marginTop: 12 }}>
        <div className="card" style={{ background: "transparent" }}>
          <div className="muted" style={{ marginBottom: 8 }}>Список</div>
          <div className="list">
            {items.map((p) => (
              <div key={p.id} className="listItem" style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
                <button className="btn btnOutline" style={{ flex: 1, textAlign: "left" }} onClick={() => pick(p)}>
                  <b>{p.name ?? p.title ?? `Товар #${p.id}`}</b>
                  <div className="muted">ID: {p.id}{p.price != null ? ` • ${p.price}` : ""}</div>
                </button>
                <button className="btn" onClick={() => remove(p.id)} disabled={busy}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: "transparent" }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            {selected ? `Редактирование #${selected.id}` : "Создание"}
          </div>

          <input className="input" placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
          <div style={{ height: 8 }} />
          <input className="input" placeholder="Цена" value={price} onChange={(e) => setPrice(e.target.value)} />
          <div style={{ height: 8 }} />
          <input className="input" placeholder="URL картинки (image_url)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <div style={{ height: 8 }} />
          <textarea className="input" placeholder="Описание" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />

          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={save} disabled={busy}>
              {selected ? "Сохранить" : "Создать"}
            </button>
            <button className="btn btnOutline" onClick={resetForm} disabled={busy}>Сброс</button>
          </div>
        </div>
      </div>
    </div>
  );
}

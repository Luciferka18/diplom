"use client";

import { useEffect, useMemo, useState } from "react";

function slugifyRu(input) {
  const s = String(input || "").trim().toLowerCase();

  const map = {
    а:"a", б:"b", в:"v", г:"g", д:"d", е:"e", ё:"e", ж:"zh", з:"z", и:"i", й:"y",
    к:"k", л:"l", м:"m", н:"n", о:"o", п:"p", р:"r", с:"s", т:"t", у:"u", ф:"f",
    х:"h", ц:"ts", ч:"ch", ш:"sh", щ:"sch", ъ:"", ы:"y", ь:"", э:"e", ю:"yu", я:"ya",
  };

  const translit = s
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");

  return translit
    .replace(/[^a-z0-9\s-]/g, "")   // выкинуть мусор
    .replace(/\s+/g, "-")          // пробелы -> дефисы
    .replace(/-+/g, "-")           // двойные дефисы
    .replace(/^-|-$/g, "");        // trim дефисов
}

export default function AdminArticlesPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft"); // draft | published

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const canPublish = useMemo(() => status === "published", [status]);

  async function load() {
    setErr(""); setOk("");
    const r = await fetch("/api/articles", { cache: "no-store" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setErr(data?.message || `Ошибка (${r.status})`);
      return;
    }
    setItems(Array.isArray(data) ? data : (data.data ?? []));
  }

  useEffect(() => { load(); }, []);

  function pick(a) {
    setSelected(a);
    setTitle(a.title ?? "");
    setSlug(a.slug ?? "");
    setContent(a.content ?? "");
    setStatus(a.status ?? "draft");
  }

  function resetForm() {
    setSelected(null);
    setTitle("");
    setSlug("");
    setContent("");
    setStatus("draft");
  }

  // автослаг: если пользователь не трогал slug руками — обновляем от title
  useEffect(() => {
    if (selected) return; // при редактировании не лезем
    if (!title) return;
    // если slug пустой или совпадает со старым автослагом — обновляем
    setSlug((prev) => {
      const auto = slugifyRu(title);
      if (!prev) return auto;
      return prev; // если пользователь уже ввёл — не трогаем
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  async function save() {
    setBusy(true); setErr(""); setOk("");
    try {
      const finalSlug = slugifyRu(slug || title);
      if (!finalSlug) throw new Error("Slug пустой. Введи заголовок или slug.");

      const payload = {
        title,
        slug: finalSlug,
        content,
        status,
        published_at: canPublish ? new Date().toISOString() : null,
      };

      const url = selected ? `/api/articles/${selected.id}` : "/api/articles";
      const method = selected ? "PUT" : "POST";

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        // теперь прокси возвращает raw если это html — увидишь причину
        const details =
          data?.errors ? JSON.stringify(data.errors) :
          data?.raw ? data.raw :
          data?.message || `Ошибка (${r.status})`;
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
    if (!confirm("Удалить статью?")) return;
    setBusy(true); setErr(""); setOk("");
    try {
      const r = await fetch(`/api/articles/${id}`, { method: "DELETE", cache: "no-store" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const details =
          data?.errors ? JSON.stringify(data.errors) :
          data?.raw ? data.raw :
          data?.message || `Ошибка (${r.status})`;
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
          <div className="h2">Статьи</div>
          <div className="muted">Поля: title, slug, content, status, published_at</div>
        </div>
        <button className="btn" onClick={load} disabled={busy}>Обновить</button>
      </div>

      {err ? <div className="error" style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{err}</div> : null}
      {ok ? (
        <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
          {ok}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, marginTop: 12 }}>
        <div className="card" style={{ background: "transparent" }}>
          <div className="muted" style={{ marginBottom: 8 }}>Список</div>
          <div className="list">
            {items.map((a) => (
              <div key={a.id} className="listItem" style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
                <button className="btn btnOutline" style={{ flex: 1, textAlign: "left" }} onClick={() => pick(a)}>
                  <b>{a.title ?? `Статья #${a.id}`}</b>
                  <div className="muted">
                    ID: {a.id}{a.slug ? ` • ${a.slug}` : ""}{a.status ? ` • ${a.status}` : ""}
                  </div>
                </button>
                <button className="btn" onClick={() => remove(a.id)} disabled={busy}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: "transparent" }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            {selected ? `Редактирование #${selected.id}` : "Создание"}
          </div>

          <input className="input" placeholder="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div style={{ height: 8 }} />

          <input
            className="input"
            placeholder="Slug (латиница, авто по заголовку)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <div style={{ height: 8 }} />

          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>

          <div style={{ height: 8 }} />

          <textarea className="input" placeholder="Контент" rows={10} value={content} onChange={(e) => setContent(e.target.value)} />

          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={save} disabled={busy}>
              {selected ? "Сохранить" : "Создать"}
            </button>
            <button className="btn btnOutline" onClick={resetForm} disabled={busy}>Сброс</button>
          </div>

          <div className="muted" style={{ marginTop: 10 }}>
            Slug автоматически приводится к латинице. Это убирает 500 из-за кириллицы/пустого slug.
          </div>
        </div>
      </div>
    </div>
  );
}

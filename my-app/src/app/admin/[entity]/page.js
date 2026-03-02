"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

export default function AdminEntityPage() {
  const params = useParams();
  const rawEntity = params?.entity;

  // алиасы на всякий случай (если кто-то руками набрал)
  const entity = useMemo(() => {
    if (!rawEntity) return rawEntity;
    if (rawEntity === "blog") return "articles";
    if (rawEntity === "shop") return "products";
    return rawEntity;
  }, [rawEntity]);

  const title = useMemo(() => {
    const map = {
      products: "Товары",
      programs: "Программы",
      trainers: "Тренеры",
      articles: "Статьи",
      orders: "Заказы",
      bookings: "Записи",
      reviews: "Отзывы",
      users: "Пользователи",
    };
    return map[entity] || entity;
  }, [entity]);

  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [errDetails, setErrDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [jsonText, setJsonText] = useState("{\n}\n");
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr("");
    setErrDetails(null);
    setLoading(true);

    try {
      const r = await fetch(`/api/admin/${entity}`, { cache: "no-store" });
      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        setErr(`Ошибка (${r.status})`);
        setErrDetails(data);
        setItems([]);
        return;
      }

      const list = Array.isArray(data) ? data : (data.data ?? []);
      setItems(list);
    } catch (e) {
      setErr("Ошибка сети/сервер не отвечает");
      setErrDetails({ message: e?.message });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!entity) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  function pick(item) {
    setSelected(item);
    setJsonText(JSON.stringify(item, null, 2));
  }

  async function create() {
    setBusy(true);
    setErr("");
    setErrDetails(null);
    try {
      const body = JSON.parse(jsonText || "{}");

      const r = await fetch(`/api/admin/${entity}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(`Ошибка (${r.status})`);
        setErrDetails(data);
        return;
      }

      setSelected(null);
      setJsonText("{\n}\n");
      await load();
    } catch (e) {
      setErr("Невалидный JSON или ошибка сети");
      setErrDetails({ message: e?.message });
    } finally {
      setBusy(false);
    }
  }

  async function update() {
    if (!selected?.id) return;
    setBusy(true);
    setErr("");
    setErrDetails(null);

    try {
      const body = JSON.parse(jsonText || "{}");

      const r = await fetch(`/api/admin/${entity}/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(`Ошибка (${r.status})`);
        setErrDetails(data);
        return;
      }

      await load();
    } catch (e) {
      setErr("Невалидный JSON или ошибка сети");
      setErrDetails({ message: e?.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm(`Удалить #${id}?`)) return;
    setBusy(true);
    setErr("");
    setErrDetails(null);

    try {
      const r = await fetch(`/api/admin/${entity}/${id}`, { method: "DELETE", cache: "no-store" });
      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        setErr(`Ошибка (${r.status})`);
        setErrDetails(data);
        return;
      }

      if (selected?.id === id) {
        setSelected(null);
        setJsonText("{\n}\n");
      }

      await load();
    } catch (e) {
      setErr("Ошибка сети/сервер не отвечает");
      setErrDetails({ message: e?.message });
    } finally {
      setBusy(false);
    }
  }

  // статусы для orders/bookings — у тебя это отдельные PATCH роуты
  async function patchStatus(kind, id, status) {
    setBusy(true);
    setErr("");
    setErrDetails(null);

    try {
      const url =
        kind === "orders"
          ? `/api/admin/orders/${id}/status`
          : `/api/admin/bookings/${id}/status`;

      const r = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        cache: "no-store",
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(`Ошибка (${r.status})`);
        setErrDetails(data);
        return;
      }

      await load();
    } catch (e) {
      setErr("Ошибка сети/сервер не отвечает");
      setErrDetails({ message: e?.message });
    } finally {
      setBusy(false);
    }
  }

  const keyOf = (it) => it.title ?? it.name ?? it.login ?? it.email ?? it.slug ?? `#${it.id}`;

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div>
          <div className="h2">{title}</div>
          <div className="muted">entity: {entity}</div>
        </div>

        <button className="btn" onClick={load} disabled={busy}>
          Обновить
        </button>
      </div>

      {loading ? <div className="muted" style={{ marginTop: 10 }}>Загрузка…</div> : null}

      {err ? (
        <div className="error" style={{ marginTop: 10 }}>
          {err}
          {errDetails ? (
            <pre style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
              {JSON.stringify(errDetails, null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, marginTop: 12 }}>
        <div className="card" style={{ background: "transparent" }}>
          <div className="muted" style={{ marginBottom: 8 }}>Список</div>

          <div className="list">
            {items.map((it) => (
              <div key={it.id} className="listItem" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <button
                  className="btn btnOutline"
                  style={{ textAlign: "left", flex: 1 }}
                  onClick={() => pick(it)}
                >
                  <div><b>{keyOf(it)}</b></div>
                  <div className="muted">ID: {it.id}</div>
                  {it.status ? <div className="muted">Статус: {it.status}</div> : null}
                </button>

                <button className="btn" onClick={() => remove(it.id)} disabled={busy}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: "transparent" }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            {selected ? `Редактирование ID ${selected.id}` : "Создание"}
          </div>

          {(entity === "orders" || entity === "bookings") && selected?.id ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <button className="btn btnOutline" disabled={busy} onClick={() => patchStatus(entity, selected.id, "new")}>new</button>
              <button className="btn btnOutline" disabled={busy} onClick={() => patchStatus(entity, selected.id, "approved")}>approved</button>
              <button className="btn btnOutline" disabled={busy} onClick={() => patchStatus(entity, selected.id, "done")}>done</button>
              <button className="btn btnOutline" disabled={busy} onClick={() => patchStatus(entity, selected.id, "canceled")}>canceled</button>
            </div>
          ) : null}

          <textarea
            className="input"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={16}
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
          />

          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {!selected ? (
              <button className="btn" onClick={create} disabled={busy}>Создать</button>
            ) : (
              <button className="btn" onClick={update} disabled={busy}>Сохранить</button>
            )}

            <button
              className="btn btnOutline"
              onClick={() => {
                setSelected(null);
                setJsonText("{\n}\n");
              }}
              disabled={busy}
            >
              Сброс
            </button>
          </div>

          <div className="muted" style={{ marginTop: 10 }}>
            Сейчас это универсальный CRUD (JSON). Если хочешь “красиво” — я сделаю формы конкретно под articles/products/trainers/programs (по твоим полям из контроллеров/моделей).
          </div>
        </div>
      </div>
    </div>
  );
}

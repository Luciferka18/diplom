// src/services/api.js

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(path, { method = "GET", body, headers } = {}) {
  const url = path.startsWith("http") ? path : `${apiBaseUrl}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text; // если сервер вернул не-JSON
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `API ${method} ${path} failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export const apiGet = (path, opts) => request(path, { ...opts, method: "GET" });
export const apiPost = (path, body, opts) =>
  request(path, { ...opts, method: "POST", body });
export const apiPut = (path, body, opts) =>
  request(path, { ...opts, method: "PUT", body });
export const apiDelete = (path, opts) =>
  request(path, { ...opts, method: "DELETE" });

// Иногда удобно иметь универсальную функцию
export const api = { apiGet, apiPost, apiPut, apiDelete, apiBaseUrl };

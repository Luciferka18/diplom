// src/services/api.js

const TOKEN_KEY = "fitlab_token";
const USER_KEY = "fitlab_user";

function isServer() {
  return typeof window === "undefined";
}

function getBackendOrigin() {
  // можно переопределить в .env.local: BACKEND_ORIGIN=http://127.0.0.1:8000
  return (process.env.BACKEND_ORIGIN || "http://127.0.0.1:8000").replace(/\/+$/, "");
}

function buildUrl(path) {
  const cleanPath = path?.startsWith("/") ? path : `/${path || ""}`;

  // ✅ SSR: напрямую в Laravel (иначе относительный /api в Node упадёт)
  if (isServer()) {
    return `${getBackendOrigin()}/api${cleanPath}`;
  }

  // ✅ Browser: через Next proxy /api/*
  return `/api${cleanPath}`;
}

function getToken() {
  if (isServer()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

function clearAuth() {
  if (isServer()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("user");
}

async function parseResponse(res) {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toError(data, status) {
  if (data?.errors) {
    const parts = [];
    for (const [k, v] of Object.entries(data.errors)) {
      parts.push(`${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);
    }
    return parts.join(" | ") || `HTTP ${status}`;
  }
  return data?.message || `HTTP ${status}`;
}

async function request(path, { method = "GET", body, headers } = {}) {
  const url = buildUrl(path);
  const token = getToken();

  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(body && !(body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
    cache: "no-store",
  });

  const data = await parseResponse(res);

  if (res.status === 401) clearAuth();

  if (!res.ok) {
    const err = new Error(toError(data, res.status));
    err.status = res.status;
    err.data = data;
    err.url = url;
    throw err;
  }

  return data;
}

export const apiGet = (path, opts) => request(path, { ...opts, method: "GET" });
export const apiPost = (path, body, opts) => request(path, { ...opts, method: "POST", body });
export const apiPut = (path, body, opts) => request(path, { ...opts, method: "PUT", body });
export const apiPatch = (path, body, opts) => request(path, { ...opts, method: "PATCH", body });
export const apiDelete = (path, opts) => request(path, { ...opts, method: "DELETE" });

// для совместимости со старым кодом (если где-то api.get/post)
export const api = {
  get: async (path, opts = {}) => ({ data: await apiGet(path, opts) }),
  post: async (path, body, opts = {}) => ({ data: await apiPost(path, body, opts) }),
  put: async (path, body, opts = {}) => ({ data: await apiPut(path, body, opts) }),
  patch: async (path, body, opts = {}) => ({ data: await apiPatch(path, body, opts) }),
  delete: async (path, opts = {}) => ({ data: await apiDelete(path, opts) }),
};

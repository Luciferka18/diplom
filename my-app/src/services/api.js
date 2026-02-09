export const apiBaseUrl = '/api';

function withBase(path) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const token = getToken();
  const res = await fetch(withBase(path), {
    method,
    headers: {
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    cache: 'no-store',
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `API ${method} ${path} failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const apiGet = (path, options) => request(path, { ...options, method: 'GET' });
export const apiPost = (path, body, options) => request(path, { ...options, method: 'POST', body });
export const apiPut = (path, body, options) => request(path, { ...options, method: 'PUT', body });
export const apiDelete = (path, options) => request(path, { ...options, method: 'DELETE' });

export const api = {
  get: async (path, options = {}) => ({ data: await apiGet(path, options) }),
  post: async (path, body, options = {}) => ({ data: await apiPost(path, body, options) }),
  put: async (path, body, options = {}) => ({ data: await apiPut(path, body, options) }),
  delete: async (path, options = {}) => ({ data: await apiDelete(path, options) }),
};

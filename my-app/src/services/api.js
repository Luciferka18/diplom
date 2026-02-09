const defaultApiBaseUrl = '/api';

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  defaultApiBaseUrl;

function withBase(path) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (apiBaseUrl.startsWith('http://') || apiBaseUrl.startsWith('https://')) {
    return `${apiBaseUrl.replace(/\/$/, '')}${path}`;
  }
  return `${apiBaseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const url = withBase(path);

  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
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
    const msg =
      (data && (data.message || data.error)) ||
      `API ${method} ${path} failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export const apiGet = (path, opts) => request(path, { ...opts, method: 'GET' });
export const apiPost = (path, body, opts) =>
  request(path, { ...opts, method: 'POST', body });
export const apiPut = (path, body, opts) =>
  request(path, { ...opts, method: 'PUT', body });
export const apiDelete = (path, opts) =>
  request(path, { ...opts, method: 'DELETE' });

export const api = {
  get: async (url, config = {}) => ({ data: await apiGet(url, config) }),
  post: async (url, body, config = {}) => ({ data: await apiPost(url, body, config) }),
  put: async (url, body, config = {}) => ({ data: await apiPut(url, body, config) }),
  delete: async (url, config = {}) => ({ data: await apiDelete(url, config) }),
};

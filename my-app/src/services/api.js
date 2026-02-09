import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export async function apiGet(url, config = {}) {
  const res = await api.get(url, config);
  return res.data;
}

export async function apiPost(url, payload = {}, config = {}) {
  const res = await api.post(url, payload, config);
  return res.data;
}

export const apiBaseUrl = baseURL;

import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({ baseURL, timeout: 10000 });

export async function apiGet(url, config = {}) {
  const res = await api.get(url, config);
  return res.data;
}

import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

export async function apiGet(url, config = {}) {
  const res = await api.get(url, config);
  return res.data;
}

export async function apiPost(url, data, config = {}) {
  const res = await api.post(url, data, config);
  return res.data;
}

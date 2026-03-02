"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiPost } from "@/services/api";

const defaultAuthState = {
  user: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
};

const AuthContext = createContext(defaultAuthState);

const STORAGE_KEY = "fitlab_user";
const TOKEN_KEY = "fitlab_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (loginOrEmail, password) => {
    // Шлём и login, и email — Laravel примет то, что валидирует
    const payload = {
      login: loginOrEmail,
      email: loginOrEmail,
      password,
    };

    const data = await apiPost("/auth/login", payload);

    // Поддержка разных форматов ответа
    const u = data?.user ?? data?.data?.user ?? null;
    const t = data?.token ?? data?.data?.token ?? null;

    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    if (t) localStorage.setItem(TOKEN_KEY, t);
  };

  
  const register = async (payload) => {
    const data = await apiPost("/auth/register", payload);

    const u = data?.user ?? data?.data?.user ?? null;
    const t = data?.token ?? data?.data?.token ?? null;

    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    if (t) localStorage.setItem(TOKEN_KEY, t);
  };

  const logout = async () => {
    try {
      await apiPost("/auth/logout");
    } catch {}
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext) || defaultAuthState;

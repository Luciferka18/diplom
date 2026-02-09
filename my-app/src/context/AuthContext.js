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

  const login = async (loginValue, password) => {
    const data = await apiPost("/auth/login", { login: loginValue, password });
    setUser(data.user || null);
    if (data.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    }
  };

  const register = async (payload) => {
    const data = await apiPost("/auth/register", payload);
    setUser(data.user || null);
    if (data.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext) || defaultAuthState;

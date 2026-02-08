"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await apiPost("/auth/login", { email, password });
    setUser(data.user);
  };

  const register = async (payload) => {
    const data = await apiPost("/auth/register", payload);
    setUser(data.user);
  };

  const logout = async () => {
    await apiPost("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

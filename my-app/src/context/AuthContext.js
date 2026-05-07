"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiPost, apiGet } from "@/services/api";

const STORAGE_KEY = "nashfit_user";
const TOKEN_KEY = "nashfit_token";

const defaultAuthState = {
  user: null,
  loading: true,
  isAuthed: false,
  isAdmin: false,
  isTrainer: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
};

const AuthContext = createContext(defaultAuthState);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка пользователя при инициализации
  useEffect(() => {
    const initAuth = async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const token = localStorage.getItem(TOKEN_KEY);

        if (!raw || !token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Проверяем валидность токена через API
        try {
          const data = await apiGet("/auth/me");
          const userData = data?.user ?? data?.data?.user ?? null;
          
          if (userData) {
            setUser(userData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
          } else {
            // Токен невалиден
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(TOKEN_KEY);
            setUser(null);
          }
        } catch {
          // Ошибка API - возможно сервер недоступен, используем кэш
          setUser(JSON.parse(raw));
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Обновление данных пользователя
  const refreshUser = useCallback(async () => {
    try {
      const data = await apiGet("/auth/me");
      const userData = data?.user ?? data?.data?.user ?? null;
      
      if (userData) {
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        return userData;
      }
      
      return null;
    } catch {
      return null;
    }
  }, []);

  const login = async (identifier, password) => {
    const payload = {
      login: identifier,
      email: identifier,
      password,
    };

    const data = await apiPost("/auth/login", payload);

    // Проверяем, требуется ли 2FA
    if (data?.requires_2fa) {
      return { requires_2fa: true, user_id: data.user_id };
    }

    const u = data?.user ?? data?.data?.user ?? null;
    const t = data?.token ?? data?.data?.token ?? null;

    if (!u || !t) {
      throw new Error("Неверный формат ответа сервера");
    }

    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    localStorage.setItem(TOKEN_KEY, t);
    
    return { requires_2fa: false, user: u, token: t };
  };

  const register = async (payload) => {
    const data = await apiPost("/auth/register", payload);

    const u = data?.user ?? data?.data?.user ?? null;
    const t = data?.token ?? data?.data?.token ?? null;

    if (!u || !t) {
      throw new Error("Неверный формат ответа сервера");
    }

    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    localStorage.setItem(TOKEN_KEY, t);
  };

  const logout = async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
      // Игнорируем ошибки при выходе
    }
    
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  // Вычисляемые свойства
  const isAuthed = !!user;
  const isAdmin = user?.role === "admin";
  const isTrainer = user?.role === "trainer";

  const value = {
    user,
    loading,
    isAuthed,
    isAdmin,
    isTrainer,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext) || defaultAuthState;

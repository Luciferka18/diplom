"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiPost, apiGet } from "@/services/api";

const STORAGE_KEY = "nashfit_user";
const TOKEN_KEY = "nashfit_token";
const LEGACY_USER_KEY = "user";
const AUTH_CHANGED_EVENT = "nashfit:auth-changed";
const LOGOUT_MARKER_KEY = "nashfit:just-logged-out";

const EXTRA_AUTH_KEYS = [
  "token",
  "auth_token",
  "authToken",
  "access_token",
  "accessToken",
  "sanctum_token",
  "laravel_token",
  "currentUser",
  "auth_user",
];

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
  completeLogin: () => {},
};

const AuthContext = createContext(defaultAuthState);

function readCachedUser() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_USER_KEY);

  if (!token || !raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
    return null;
  }
}

function dispatchAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

function markJustLoggedOut() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LOGOUT_MARKER_KEY, String(Date.now()));
  } catch {
    // ignore storage errors
  }
}

function clearJustLoggedOut() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LOGOUT_MARKER_KEY);
  } catch {
    // ignore storage errors
  }
}

function writeSession(user, token) {
  if (typeof window === "undefined") return;

  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    const serialized = JSON.stringify(user);
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(LEGACY_USER_KEY, serialized);
  }

  clearJustLoggedOut();
  dispatchAuthChanged();
}

function clearSession({ markLogout = false } = {}) {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  EXTRA_AUTH_KEYS.forEach((key) => localStorage.removeItem(key));

  if (markLogout) markJustLoggedOut();

  dispatchAuthChanged();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncFromStorage = useCallback(() => {
    const cached = readCachedUser();
    setUser(cached);
    return cached;
  }, []);

  useEffect(() => {
    const onAuthChanged = () => syncFromStorage();
    const onStorage = (event) => {
      if (!event.key || [STORAGE_KEY, TOKEN_KEY, LEGACY_USER_KEY, ...EXTRA_AUTH_KEYS].includes(event.key)) {
        syncFromStorage();
      }
    };

    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, [syncFromStorage]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const cached = readCachedUser();
        const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

        if (!cached || !token) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(cached);

        try {
          const data = await apiGet("/auth/me");
          const userData = data?.user ?? data?.data?.user ?? null;

          if (userData) {
            setUser(userData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(userData));
          } else {
            clearSession();
            setUser(null);
          }
        } catch {
          // If there is no token anymore, do not keep stale user in memory.
          if (!localStorage.getItem(TOKEN_KEY)) {
            setUser(null);
            clearSession();
          } else {
            setUser(cached);
          }
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const completeLogin = useCallback((nextUser, token) => {
    if (!nextUser || !token) return null;
    setUser(nextUser);
    writeSession(nextUser, token);
    return nextUser;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiGet("/auth/me");
      const userData = data?.user ?? data?.data?.user ?? null;

      if (userData) {
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(userData));
        return userData;
      }

      return null;
    } catch {
      if (typeof window !== "undefined" && !localStorage.getItem(TOKEN_KEY)) {
        setUser(null);
      }
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

    if (data?.requires_2fa) {
      return { requires_2fa: true, user_id: data.user_id };
    }

    const u = data?.user ?? data?.data?.user ?? null;
    const t = data?.token ?? data?.data?.token ?? null;

    if (!u || !t) {
      throw new Error("Неверный формат ответа сервера");
    }

    completeLogin(u, t);

    return { requires_2fa: false, user: u, token: t };
  };

  const register = async (payload) => {
    const data = await apiPost("/auth/register", payload);

    const u = data?.user ?? data?.data?.user ?? null;
    const t = data?.token ?? data?.data?.token ?? null;

    if (!u || !t) {
      throw new Error("Неверный формат ответа сервера");
    }

    completeLogin(u, t);
  };

  const logout = async () => {
    // Clear local state first. This prevents a stale user from redirecting /login
    // back to / or /account during the first seconds after logout.
    setUser(null);
    clearSession({ markLogout: true });

    try {
      await apiPost("/auth/logout");
    } catch {
      // ignore logout errors because the local session is already removed
    }

    setUser(null);
    clearSession({ markLogout: true });
  };

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
    completeLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext) || defaultAuthState;

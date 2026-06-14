"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  mounted: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

function systemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(nextTheme) {
  const root = document.documentElement;
  root.setAttribute("data-theme-transition", "off");
  root.classList.toggle("dark", nextTheme === "dark");
  root.dataset.theme = nextTheme;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.removeAttribute("data-theme-transition"));
  });
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("nashfit-theme") || localStorage.getItem("theme");
    const initial = stored === "dark" || stored === "light" ? stored : systemTheme();
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((nextTheme) => {
    const safeTheme = nextTheme === "dark" ? "dark" : "light";
    setThemeState(safeTheme);
    localStorage.setItem("nashfit-theme", safeTheme);
    localStorage.setItem("theme", safeTheme);
    applyTheme(safeTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo(() => ({ theme, mounted, setTheme, toggleTheme }), [theme, mounted, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

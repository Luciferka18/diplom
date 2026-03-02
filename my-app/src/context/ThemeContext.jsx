"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

function applyThemeClass(nextTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", nextTheme === "dark");
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const systemDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial = stored === "dark" || stored === "light" ? stored : systemDark ? "dark" : "light";

    setThemeState(initial);
    applyThemeClass(initial);
  }, []);

  const setTheme = (nextTheme) => {
    setThemeState(nextTheme);
    applyThemeClass(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

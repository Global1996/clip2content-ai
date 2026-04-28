"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

const STORAGE_KEY = "clip2theme";

function readResolvedFromDom(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

type ThemeContextValue = {
  resolved: "light" | "dark";
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [resolved, setResolved] = useState<"light" | "dark">(() =>
    readResolvedFromDom()
  );

  useLayoutEffect(() => {
    setResolved(readResolvedFromDom());
    const obs = new MutationObserver(() =>
      setResolved(readResolvedFromDom())
    );
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  const toggle = useCallback(() => {
    const next = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    document.documentElement.classList.toggle("dark", next === "dark");
    setResolved(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ resolved, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeToggle() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeToggle must be used within ThemeProvider");
  }
  return ctx;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "clip2theme";

function readResolvedFromDom(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Subscribe to <html class> changes — keeps theme state in sync without setState-in-effect. */
function subscribeToHtmlClass(onStoreChange: () => void): () => void {
  if (typeof document === "undefined") return () => undefined;
  const obs = new MutationObserver(onStoreChange);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => obs.disconnect();
}

type ThemeContextValue = {
  resolved: "light" | "dark";
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  /** SSR snapshot is "dark" to match the pre-paint script default + avoid hydration mismatches. */
  const resolved = useSyncExternalStore(
    subscribeToHtmlClass,
    readResolvedFromDom,
    () => "dark" as const
  );

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
    /* MutationObserver from useSyncExternalStore picks up the class change. */
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

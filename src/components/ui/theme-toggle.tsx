"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useThemeToggle } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, toggle } = useThemeToggle();
  const dark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn(
        "touch-manipulation relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-surface/80 text-foreground shadow-soft transition-[transform,box-shadow,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-surface-elevated hover:shadow-soft-lg active:scale-[0.96]",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? "moon" : "sun"}
          initial={{ rotate: -40, opacity: 0, scale: 0.85 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 40, opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center"
        >
          {dark ? <MoonIcon /> : <SunIcon />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      className="h-[1.125rem] w-[1.125rem] text-amber-600 dark:text-amber-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="h-[1.125rem] w-[1.125rem] text-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z"
      />
    </svg>
  );
}

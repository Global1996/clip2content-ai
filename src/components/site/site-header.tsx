"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VirloWordmark } from "@/components/brand/virlo-logo";

const links = [
  { href: "/#features", label: "Product" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Sync with external state (Next router) — close menu when route changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-border-subtle bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75"
    >
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top,0px)] sm:h-[60px] sm:gap-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <VirloWordmark href="/" className="touch-manipulation" onClick={() => setMenuOpen(false)} size="sm" />

        <nav
          className="hidden items-center gap-6 sm:flex sm:gap-8"
          aria-label="Main"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="touch-manipulation text-sm text-muted transition-opacity duration-200 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1 sm:flex-none sm:gap-3">
          <ThemeToggle className="shrink-0" />
          <Link
            href="/login"
            className="touch-manipulation hidden rounded-xl px-4 py-2 text-sm text-muted transition-colors duration-200 hover:bg-surface hover:text-foreground sm:inline-flex sm:py-2"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="touch-manipulation hidden rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-glow transition duration-200 hover:brightness-110 active:scale-[0.98] sm:inline-flex"
          >
            Start free
          </Link>

          <button
            type="button"
            className="touch-manipulation inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border-subtle bg-surface/80 text-foreground sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Menu"}</span>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border-subtle bg-background sm:hidden"
          >
            <nav
              className="flex flex-col gap-1 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
              aria-label="Mobile"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "touch-manipulation rounded-xl px-4 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-surface",
                    pathname === l.href.split("#")[0] && "bg-surface/80"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="touch-manipulation rounded-xl px-4 py-3.5 text-base text-muted transition-colors hover:bg-surface hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="touch-manipulation mt-2 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-4 py-3 text-base font-semibold text-white shadow-glow transition hover:brightness-110"
                onClick={() => setMenuOpen(false)}
              >
                Start free
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

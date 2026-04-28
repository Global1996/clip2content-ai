"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useDashboardData } from "@/components/dashboard/dashboard-context";

export type TopNavUser = {
  displayName: string;
  email: string | null;
};

export function DashboardTopNav({
  user,
  onMenuClick,
}: {
  user: TopNavUser;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { usage } = useDashboardData();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  async function signOut() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials =
    user.displayName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0B0F19]/85 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0B0F19]/75">
      <div className="mx-auto flex min-h-14 max-w-[1600px] items-center justify-between gap-3 px-4 pt-[max(0.25rem,env(safe-area-inset-top))] sm:min-h-16 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition-[border-color,background-color,transform] duration-200 ease-out hover:border-white/[0.12] hover:bg-white/[0.07] active:scale-[0.94] lg:hidden"
          onClick={onMenuClick}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeWidth={1.75} strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden flex-1 lg:block" />

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="border-white/[0.08] bg-white/[0.04] text-zinc-100 transition-[border-color,background-color,transform] duration-200 hover:bg-white/[0.07] active:scale-[0.94]" />

          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-400 transition-[border-color,background-color,color,transform] duration-200 hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-zinc-200 active:scale-[0.94]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth={1.5} strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.082A2.918 2.918 0 0118 14.724v-5.52a9 9 0 10-18 0v5.52a2.918 2.918 0 011.411 2.276 23.848 23.848 0 005.454 1.082M9 17h6" />
            </svg>
          </button>

          {!usage.unlimited && (
            <Link
              href="/pricing"
              className="dash-btn-shine inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_28px_-8px_rgba(124,58,237,0.55)] ring-1 ring-white/10 transition-[filter,transform,box-shadow] duration-200 hover:brightness-110 hover:shadow-[0_12px_36px_-10px_rgba(124,58,237,0.55)] active:scale-[0.97] sm:px-4 sm:text-sm"
            >
              <span className="sm:hidden">Go Pro</span>
              <span className="hidden sm:inline">Upgrade to Pro</span>
            </Link>
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] py-1.5 pl-1.5 pr-2 transition-[border-color,background-color,transform] duration-200 hover:border-white/[0.12] hover:bg-white/[0.07] active:scale-[0.97]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-[11px] font-bold text-white">
                {initials}
              </span>
              <span className="hidden max-w-[120px] truncate text-left text-sm font-medium text-zinc-200 sm:block">
                {user.displayName}
              </span>
              <svg className="hidden h-4 w-4 text-zinc-500 sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeWidth={2} strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  key="account-menu"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full z-50 mt-2 w-52 origin-top rounded-xl border border-white/[0.08] bg-[#111827]/95 py-1 shadow-2xl backdrop-blur-xl"
                >
                  <p className="border-b border-white/[0.06] px-3 py-2 text-xs text-zinc-500">
                    {user.email}
                  </p>
                  <Link
                    href="/pricing"
                    className="block px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/[0.06]"
                    onClick={() => setOpen(false)}
                  >
                    Billing & plans
                  </Link>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-white/[0.06]"
                    onClick={() => {
                      setOpen(false);
                      signOut();
                    }}
                  >
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

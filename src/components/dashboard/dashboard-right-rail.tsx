"use client";

import Link from "next/link";
import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useDashboardData } from "@/components/dashboard/dashboard-context";
import {
  PRO_VALUE_POINTS,
  UpgradeToProLink,
  UpgradeToProTextLink,
} from "@/components/dashboard/upgrade-conversion";

const TOOL_LINKS = [
  { href: "/dashboard/tools/hook-generator", label: "Hook Generator" },
  { href: "/dashboard/tools/caption-generator", label: "Caption Generator" },
  { href: "/dashboard/tools/script-generator", label: "Script Generator" },
  { href: "/dashboard/tools/idea-generator", label: "Idea Generator" },
  { href: "/dashboard/tools/hashtag-generator", label: "Hashtag Generator" },
] as const;

const QUICK_ACTIONS = [
  { href: "/dashboard/generate", label: "Repurpose content", hint: "Paste a new angle" },
  { href: "/dashboard/templates", label: "Create from template", hint: "Browse presets" },
  {
    href: "/dashboard/brand-voice",
    label: "Save as brand voice",
    hint: "Pro · Voice profiles (soon)",
  },
] as const;

const TEMPLATE_LINKS = [
  {
    href: "/dashboard/templates",
    label: "TikTok Hook",
    tag: "Short-form",
  },
  {
    href: "/dashboard/templates",
    label: "Instagram Post",
    tag: "Carousel-ready",
  },
  {
    href: "/dashboard/templates",
    label: "YouTube Script",
    tag: "Talking-head",
  },
] as const;

export function DashboardRightRail() {
  const { usage, stats } = useDashboardData();
  const gradId = useId().replace(/:/g, "");
  const prefersReducedMotion = useReducedMotion();

  const remaining = usage.remainingToday;
  const limit = usage.dailyLimit;
  const dailyUsed =
    limit != null && remaining != null ? Math.max(0, limit - remaining) : 0;
  const frac =
    usage.unlimited || limit == null
      ? 0.15
      : Math.min(1, dailyUsed / Math.max(limit, 1));
  const circumference = 2 * Math.PI * 36;
  const offset = circumference * (1 - frac);

  return (
    <aside className="sticky top-24 hidden h-fit w-[320px] shrink-0 flex-col gap-5 xl:flex">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-[#111827]/90 p-5 shadow-xl backdrop-blur-md"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Tools
        </p>
        <div className="mt-3 grid gap-2">
          {TOOL_LINKS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-zinc-200 transition-[border-color,background-color,transform] duration-200 hover:border-violet-500/25 hover:bg-violet-500/10 hover:text-white active:scale-[0.99]"
            >
              <span className="flex items-center justify-between gap-2">
                {t.label}
                <span className="text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-violet-300">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.03, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-[#111827]/90 p-5 shadow-xl backdrop-blur-md"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Quick actions
        </p>
        <ul className="mt-3 space-y-1">
          {QUICK_ACTIONS.map((q) => {
            const showProBadge = q.label === "Save as brand voice";
            return (
              <li key={q.href + q.label}>
                <Link
                  href={q.href}
                  className="group/action block rounded-xl px-3 py-2 transition-colors hover:bg-white/[0.05]"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-100">{q.label}</span>
                    {showProBadge && (
                      <span className="shrink-0 rounded-md bg-gradient-to-r from-amber-500/25 to-violet-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200/95 ring-1 ring-amber-500/25">
                        Pro
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-500">{q.hint}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-[#111827]/90 p-5 shadow-xl backdrop-blur-md"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Templates
        </p>
        <ul className="mt-3 space-y-2">
          {TEMPLATE_LINKS.map((tmpl, i) => (
            <li key={i}>
              <Link
                href={tmpl.href}
                className="flex flex-col rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 transition hover:border-violet-500/25 hover:bg-white/[0.05]"
              >
                <span className="text-sm font-medium text-white">{tmpl.label}</span>
                <span className="text-[11px] text-zinc-500">{tmpl.tag}</span>
              </Link>
            </li>
          ))}
        </ul>
      </motion.section>

      {!usage.unlimited ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                  y: -2,
                  transition: { type: "spring", stiffness: 420, damping: 32 },
                }
          }
          className="overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-b from-violet-600/[0.22] to-blue-600/[0.08] p-5 shadow-[0_0_50px_-12px_rgba(124,58,237,0.45)] transition-[border-color,box-shadow] duration-300 hover:border-violet-400/35 hover:shadow-[0_0_56px_-10px_rgba(124,58,237,0.5)]"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-200/95 ring-1 ring-amber-400/35">
              Popular
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-200/90">
              Virlo Pro
            </p>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-white">
            Ship content without limits
          </h3>
          <ul className="mt-4 space-y-2.5">
            {PRO_VALUE_POINTS.map((line) => (
              <li
                key={line}
                className="flex gap-2.5 text-sm leading-snug text-zinc-300"
              >
                <span
                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25"
                  aria-hidden
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <UpgradeToProLink className="mt-5 w-full py-3 text-[15px] shadow-xl">
            Upgrade to Pro
          </UpgradeToProLink>
          <p className="mt-3 text-center text-[11px] text-zinc-500">
            Cancel anytime · Secure checkout via Stripe
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-5 shadow-lg backdrop-blur-md"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-400/90">
            Active subscription
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            You&apos;re on{" "}
            <span className="font-semibold capitalize text-white">{usage.plan}</span>
            — unlimited generations unlocked.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.09]"
          >
            Manage billing
          </Link>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-[#111827]/90 p-5 shadow-xl backdrop-blur-md transition-[border-color] duration-300 hover:border-white/[0.09]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Usage today
        </p>
        <div className="mt-4 flex items-center gap-5">
          <div className="relative h-[88px] w-[88px] shrink-0">
            <svg className="-rotate-90" viewBox="0 0 88 88" aria-hidden>
              <circle
                cx="44"
                cy="44"
                r="36"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              <motion.circle
                cx="44"
                cy="44"
                r="36"
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={false}
                animate={{ strokeDashoffset: usage.unlimited ? 0 : offset }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
              />
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#a78bfa" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold tabular-nums text-white">
                {usage.unlimited ? "∞" : remaining ?? "—"}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                left
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1 text-sm text-zinc-400">
            <p>
              <span className="font-medium text-white">{stats.totalGenerations}</span>{" "}
              total packs
            </p>
            <p className="mt-2 text-xs leading-relaxed">
              {usage.unlimited
                ? "No daily cap on your plan."
                : `${remaining ?? "—"} of ${limit ?? "—"} generations left today (UTC).`}
            </p>
            {!usage.unlimited && (
              <p className="mt-3">
                <UpgradeToProTextLink className="text-[13px]">
                  Upgrade for unlimited runs →
                </UpgradeToProTextLink>
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] p-5"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-400/90">
          Pro tip
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          Pair a sharp hook with one bold proof point — specificity beats generic hype every time.
          Toggle tools on the left when you only need hooks or captions.
        </p>
      </motion.section>
    </aside>
  );
}

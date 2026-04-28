"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useDashboardData } from "@/components/dashboard/dashboard-context";
import { UpgradeToProTextLink } from "@/components/dashboard/upgrade-conversion";

const icons = {
  total: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  ),
  month: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  left: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  star: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
};

export function DashboardStatsGrid() {
  const prefersReducedMotion = useReducedMotion();
  const { stats, usage } = useDashboardData();
  const growth = stats.monthGrowthPercent;
  const growthLabel =
    growth == null ? "—" : growth >= 0 ? `+${growth}%` : `${growth}%`;

  const leftLabel =
    usage.unlimited || usage.remainingToday == null
      ? "Unlimited"
      : String(usage.remainingToday);

  const cards = [
    {
      key: "total",
      label: "Total generations",
      value: stats.totalGenerations,
      sub: "All time",
      icon: icons.total,
      accent: "from-violet-500/25 to-blue-500/10",
    },
    {
      key: "month",
      label: "This month",
      value: stats.thisMonthCount,
      sub: growth !== null ? `${growthLabel} vs last month` : "New month",
      icon: icons.month,
      accent: "from-blue-500/25 to-cyan-500/10",
    },
    {
      key: "left",
      label: "Generations left",
      value: leftLabel,
      sub: usage.unlimited ? "Your plan" : "Resets UTC daily",
      icon: icons.left,
      accent: "from-emerald-500/20 to-teal-500/10",
    },
    {
      key: "fav",
      label: "Favorites",
      value: stats.favoritesCount,
      sub: usage.unlimited ? "Coming soon" : "Pro unlock · saved packs",
      icon: icons.star,
      accent: "from-amber-500/20 to-orange-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                  y: -3,
                  transition: { type: "spring", stiffness: 420, damping: 28 },
                }
          }
          className="group relative flex h-full min-h-[156px] cursor-default flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]/70 p-5 shadow-xl shadow-black/20 backdrop-blur-md transition-[box-shadow,border-color] duration-300 ease-out hover:border-violet-500/22 hover:shadow-[0_22px_48px_-28px_rgba(124,58,237,0.35)]"
        >
          <div
            className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${c.accent} opacity-60 blur-2xl transition group-hover:opacity-90`}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {c.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {c.value}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{c.sub}</p>
              {c.key === "left" && !usage.unlimited && (
                <div className="mt-4 border-t border-white/[0.06] pt-3">
                  <UpgradeToProTextLink className="text-[13px]">
                    Never worry about caps →
                  </UpgradeToProTextLink>
                </div>
              )}
            </div>
            <div className="rounded-xl bg-gradient-to-br from-white/[0.08] to-transparent p-2.5 text-violet-400 transition-[transform,color] duration-300 ease-out group-hover:scale-110 group-hover:text-violet-300">
              {c.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

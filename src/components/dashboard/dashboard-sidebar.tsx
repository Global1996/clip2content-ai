"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/components/dashboard/dashboard-context";
import { VirloWordmark } from "@/components/brand/virlo-logo";
import {
  getFreeQuotaTone,
  UpgradeToProLink,
} from "@/components/dashboard/upgrade-conversion";

type NavIcon = React.ComponentType<{ className?: string }>;

type NavDef = {
  href: string;
  label: string;
  icon: NavIcon;
};

const MAIN: NavDef[] = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/dashboard/generate", label: "Generate", icon: IconSparkles },
];

const TOOLS: NavDef[] = [
  {
    href: "/dashboard/tools/hook-generator",
    label: "Hook Generator",
    icon: IconBolt,
  },
  {
    href: "/dashboard/tools/caption-generator",
    label: "Caption Generator",
    icon: IconCaption,
  },
  {
    href: "/dashboard/tools/script-generator",
    label: "Script Generator",
    icon: IconFilm,
  },
  {
    href: "/dashboard/tools/idea-generator",
    label: "Idea Generator",
    icon: IconBulb,
  },
  {
    href: "/dashboard/tools/hashtag-generator",
    label: "Hashtag Generator",
    icon: IconHash,
  },
];

const PERSONAL: NavDef[] = [
  { href: "/dashboard/favorites", label: "Favorites", icon: IconHeart },
  { href: "/dashboard/brand-voice", label: "Brand Voice", icon: IconMic },
];

function matchActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SidebarUser = {
  displayName: string;
  email: string | null;
};

export function DashboardSidebar({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: SidebarUser;
}) {
  const pathname = usePathname();
  const { usage } = useDashboardData();

  const daily =
    usage.dailyLimit != null && usage.remainingToday != null
      ? usage.dailyLimit - usage.remainingToday
      : 0;
  const cap = usage.dailyLimit ?? 3;
  const pct =
    usage.unlimited || usage.dailyLimit == null
      ? 100
      : Math.min(100, Math.round((daily / Math.max(cap, 1)) * 100));

  const sidebarTone =
    usage.unlimited || usage.remainingToday == null
      ? null
      : getFreeQuotaTone(usage.remainingToday);

  const usageShell =
    sidebarTone === "urgent"
      ? "border-rose-500/35 shadow-[0_0_44px_-14px_rgba(244,63,94,0.35)]"
      : sidebarTone === "warning"
        ? "border-amber-500/30 shadow-[0_0_36px_-14px_rgba(245,158,11,0.22)]"
        : "border-white/[0.06] shadow-[0_0_40px_-12px_rgba(124,58,237,0.35)]";

  const initials =
    user.displayName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[292px] flex-col border-r border-white/[0.06] bg-[#0c101c]/95 backdrop-blur-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 sm:h-16 sm:px-5">
        <VirloWordmark href="/dashboard" onClick={onClose} size="md" />
      </div>

      <nav className="dash-nav-scroll flex flex-1 flex-col gap-7 overflow-y-auto px-4 py-6">
        <NavCluster title="Main" items={MAIN} pathname={pathname} onNavigate={onClose} />
        <NavCluster title="Tools" items={TOOLS} pathname={pathname} onNavigate={onClose} />
        <NavCluster
          title="Personal"
          items={PERSONAL}
          pathname={pathname}
          onNavigate={onClose}
        />
      </nav>

      <div className="border-t border-white/[0.06] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div
          className={cn(
            "rounded-2xl border bg-white/[0.03] p-4 transition-[border-color,box-shadow] duration-300 hover:border-white/[0.09]",
            usageShell
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Usage
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                <span className="capitalize">
                  {usage.unlimited
                    ? usage.plan === "lifetime"
                      ? "Lifetime"
                      : "Pro"
                    : "Free"}
                </span>
                <span className="font-normal text-zinc-500"> · Plan</span>
              </p>
              {!usage.unlimited && usage.remainingToday !== null && sidebarTone === "urgent" && (
                <p className="mt-2 text-xs font-medium leading-snug text-rose-200/95">
                  {usage.remainingToday === 0
                    ? "Daily limit reached — Pro removes the cap."
                    : "Last free run today — don't lose momentum."}
                </p>
              )}
            </div>
            {!usage.unlimited && usage.remainingToday !== null && (
              <UpgradeToProLink size="sm" className="shadow-md" onClick={onClose}>
                Upgrade to Pro
              </UpgradeToProLink>
            )}
          </div>
          {!usage.unlimited && usage.remainingToday != null && (
            <>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {usage.remainingToday} of {usage.dailyLimit ?? 3} generations left
                today <span className="text-zinc-600">(UTC)</span>
              </p>
            </>
          )}
          {usage.unlimited && (
            <p className="mt-2 text-xs text-emerald-400/90">Unlimited generations</p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl px-0.5 py-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-xs font-bold text-white shadow-lg shadow-violet-500/25">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user.displayName}</p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavCluster({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: NavDef[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        {title}
      </p>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const active = matchActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.99]",
                active
                  ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                  active ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {active && (
                <motion.span
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[#7C3AED] via-[#2563EB] to-[#22D3EE]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function IconDashboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 12a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function IconSparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  );
}

function IconBolt(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function IconCaption(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337L5.05 21l1.395-3.72C5.512 15.042 5 13.574 5 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

function IconHash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h18m-9.906-18L7.875 21M16.125 21 13.875 4.5" />
    </svg>
  );
}

function IconBulb(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a75.097 75.097 0 01-6 0 12.582 12.582 0 01-.665-.062 48.641 48.641 0 01-5.051-.734 11.943 11.943 0 01-5.052-3.036 11.943 11.943 0 01-3.036-5.052 48.641 48.641 0 01-.734-5.052 12.582 12.582 0 01-.062-.665 75.097 75.097 0 011.049-6 75.097 75.097 0 016-1.049 48.641 48.641 0 015.052-.734 11.943 11.943 0 015.052 3.036 11.943 11.943 0 013.036 5.052 48.641 48.641 0 01.734 5.052 12.582 12.582 0 01.062.665 75.097 75.097 0 01-1.049 6 75.097 75.097 0 01-6 1.049z" />
    </svg>
  );
}

function IconFilm(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125V5.625m17.25 12.75a1.125 1.125 0 001.125-1.125V5.625m-19.5 0a1.125 1.125 0 011.125-1.125h15.75a1.125 1.125 0 011.125 1.125m-19.5 0v12.75a1.125 1.125 0 001.125 1.125m0 0h15.75a1.125 1.125 0 001.125-1.125V5.625m-19.5 0h19.5" />
    </svg>
  );
}

function IconHeart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function IconMic(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3v-6a3 3 0 016 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

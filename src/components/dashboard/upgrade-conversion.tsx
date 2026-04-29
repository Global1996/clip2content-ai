"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { FREE_DAILY_GENERATION_LIMIT } from "@/lib/billing/constants";
import { useDashboardData } from "@/components/dashboard/dashboard-context";

/** Short bullets for Pro upsells — keep honest vs roadmap items */
export const PRO_VALUE_POINTS = [
  "Unlimited generations — ship without daily countdown stress",
  "Priority throughput when demand spikes",
  "Brand voice vault & analytics (rolling out)",
  "Stripe-backed billing — upgrade or cancel anytime",
] as const;

/** Conversion paywall — paired with GenerationPaywallPanel */
export const PAYWALL_VALUE_POINTS = [
  "Unlimited generations",
  "Faster content creation — no daily ceiling",
  "Access to all tools & workflows",
] as const;

export type UpgradeTone = "default" | "warning" | "urgent";

export function getFreeQuotaTone(remaining: number): UpgradeTone {
  if (remaining <= 0) return "urgent";
  if (remaining === 1) return "warning";
  return "default";
}

type UpgradeLinkProps = {
  className?: string;
  size?: "sm" | "md";
  children?: React.ReactNode;
  onClick?: () => void;
};

export function UpgradeToProLink({
  className,
  size = "md",
  children,
  onClick,
}: UpgradeLinkProps) {
  const sizes =
    size === "sm"
      ? "rounded-lg px-3 py-1.5 text-[11px]"
      : "rounded-xl px-4 py-2.5 text-sm";
  return (
    <Link
      href="/pricing"
      onClick={onClick}
      className={cn(
        "dash-btn-shine inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600 font-semibold text-white shadow-[0_8px_30px_-8px_rgba(124,58,237,0.55)] ring-1 ring-white/10 transition-[filter,transform,box-shadow] duration-200 hover:brightness-[1.08] hover:shadow-[0_12px_36px_-10px_rgba(124,58,237,0.65)] active:scale-[0.98]",
        sizes,
        className
      )}
    >
      {children ?? "Upgrade to Pro"}
    </Link>
  );
}

/** Compact inline — stats row, rails, headers */
export function UpgradeToProTextLink({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href="/pricing"
      className={cn(
        "font-semibold text-violet-400 underline-offset-4 transition-colors hover:text-violet-300 hover:underline",
        className
      )}
    >
      {children ?? "Upgrade to Pro"}
    </Link>
  );
}

/** Full-width contextual banner — generator, home */
export function FreeQuotaConversionBanner({
  className,
}: {
  className?: string;
}) {
  const { usage } = useDashboardData();
  if (usage.unlimited || usage.remainingToday == null) return null;

  const limit = usage.dailyLimit ?? FREE_DAILY_GENERATION_LIMIT;
  const remaining = usage.remainingToday;
  const tone = getFreeQuotaTone(remaining);

  const shell = {
    default:
      "border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent",
    warning:
      "border-amber-500/35 bg-gradient-to-br from-amber-500/[0.12] to-amber-600/[0.04]",
    urgent:
      "border-rose-500/45 bg-gradient-to-br from-rose-500/[0.14] to-violet-950/30 shadow-[0_0_40px_-16px_rgba(244,63,94,0.35)]",
  }[tone];

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        shell,
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          <span className="text-rose-400/95">Limited free usage</span>
          <span className="text-zinc-600"> · </span>
          {limit}/day UTC on Free
        </p>
        <p className="text-sm leading-snug">
          {remaining === 0 ? (
            <>
              <span className="font-semibold text-white">
                You&apos;ve reached your free limit.
              </span>{" "}
              <span className="text-zinc-400">
                Upgrade to keep generating — or wait until UTC midnight.
              </span>
            </>
          ) : remaining === 1 ? (
            <>
              <span className="font-semibold text-amber-100">
                Last free generation today.
              </span>{" "}
              <span className="text-zinc-400">
                Next attempt locks until tomorrow UTC — Pro is unlimited.
              </span>
            </>
          ) : tone === "warning" ? (
            <>
              <span className="font-semibold text-amber-100/95">
                {remaining} generations left
              </span>{" "}
              <span className="text-zinc-400">
                before the daily reset. Pro removes the cap entirely.
              </span>
            </>
          ) : (
            <>
              <span className="text-zinc-100">
                <span className="font-semibold text-white">{remaining}</span> of{" "}
                {limit} free generations left today.
              </span>{" "}
              <span className="text-zinc-500">
                Limited free usage · resets UTC midnight.
              </span>
            </>
          )}
        </p>
      </div>
      <UpgradeToProLink size="sm" className="shrink-0 shadow-lg">
        Upgrade to Pro – $9/month
      </UpgradeToProLink>
    </div>
  );
}

/** Single line — under stats, non-intrusive */
export function FreeQuotaMeterLine() {
  const { usage } = useDashboardData();
  if (usage.unlimited || usage.remainingToday == null) return null;

  const limit = usage.dailyLimit ?? FREE_DAILY_GENERATION_LIMIT;
  const remaining = usage.remainingToday;
  const used = limit - remaining;

  return (
    <p className="text-center text-[13px] leading-relaxed text-zinc-500">
      Free plan:{" "}
      <span className="font-medium tabular-nums text-zinc-300">
        {used}/{limit}
      </span>{" "}
      generations used today (UTC).{" "}
      <UpgradeToProTextLink>Unlimited with Pro →</UpgradeToProTextLink>
    </p>
  );
}

/** High-intent paywall — blurred “output” preview + upgrade story */
export function GenerationPaywallPanel({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-rose-500/30 bg-[#0a0d14]/95 shadow-[0_32px_90px_-48px_rgba(244,63,94,0.35)]",
        className
      )}
      role="region"
      aria-labelledby="paywall-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(244,63,94,0.12),transparent_55%)]" />

      <div className="relative min-h-[240px] sm:min-h-[260px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 space-y-3 px-8 pb-8 pt-10 blur-[10px] brightness-[0.55]"
          aria-hidden
        >
          <div className="mx-auto h-3 max-w-[85%] rounded-full bg-zinc-500/90" />
          <div className="mx-auto h-3 max-w-full rounded-full bg-zinc-600/80" />
          <div className="mx-auto h-3 max-w-[72%] rounded-full bg-zinc-500/75" />
          <div className="mx-auto mt-6 h-24 max-w-full rounded-2xl bg-zinc-700/50" />
          <div className="mx-auto h-3 max-w-[90%] rounded-full bg-zinc-600/70" />
          <div className="mx-auto h-3 max-w-[68%] rounded-full bg-zinc-500/65" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07090f]/78 px-5 backdrop-blur-[3px] sm:px-10">
          <span className="mb-4 inline-flex items-center rounded-full border border-rose-500/35 bg-rose-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-200">
            Limited free usage
          </span>
          <h3
            id="paywall-heading"
            className="max-w-md text-center text-xl font-semibold tracking-tight text-white sm:text-2xl"
          >
            You&apos;ve reached your free limit
          </h3>
          <ul className="mt-5 max-w-sm space-y-2.5 text-left text-[15px] leading-snug text-zinc-300">
            {PAYWALL_VALUE_POINTS.map((line) => (
              <li key={line} className="flex gap-3">
                <span
                  className="mt-0.5 shrink-0 text-emerald-400"
                  aria-hidden
                >
                  ✓
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            className="dash-btn-shine mt-8 inline-flex min-h-[48px] min-w-[220px] items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600 px-8 text-[15px] font-semibold text-white shadow-[0_16px_48px_-16px_rgba(124,58,237,0.55)] ring-1 ring-white/10 transition hover:brightness-[1.08] active:scale-[0.98]"
          >
            Upgrade to Pro – $9/month
          </Link>
          <p className="mt-4 max-w-xs text-center text-xs leading-relaxed text-zinc-500">
            Resets at UTC midnight on Free — Pro stays unlimited.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/components/dashboard/dashboard-context";

/** Short bullets for Pro upsells — keep honest vs roadmap items */
export const PRO_VALUE_POINTS = [
  "Unlimited generations — ship without daily countdown stress",
  "Priority throughput when demand spikes",
  "Brand voice vault & analytics (rolling out)",
  "Stripe-backed billing — upgrade or cancel anytime",
] as const;

export type UpgradeTone = "default" | "warning" | "urgent";

export function getFreeQuotaTone(remaining: number): UpgradeTone {
  if (remaining <= 1) return "urgent";
  if (remaining === 2) return "warning";
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

  const limit = usage.dailyLimit ?? 3;
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
          Free plan · Daily limit ({limit}/day UTC)
        </p>
        <p className="text-sm leading-snug">
          {remaining === 0 ? (
            <>
              <span className="font-semibold text-white">
                You&apos;ve hit today&apos;s cap.
              </span>{" "}
              <span className="text-zinc-400">
                Come back after UTC midnight — or go unlimited with Pro.
              </span>
            </>
          ) : remaining === 1 ? (
            <>
              <span className="font-semibold text-amber-100">
                Only 1 generation left today.
              </span>{" "}
              <span className="text-zinc-400">
                Don&apos;t lose your streak — upgrade for unlimited packs.
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
              <span className="text-zinc-500">Resets UTC midnight.</span>
            </>
          )}
        </p>
      </div>
      <UpgradeToProLink size="sm" className="shrink-0 shadow-lg">
        Upgrade to Pro
      </UpgradeToProLink>
    </div>
  );
}

/** Single line — under stats, non-intrusive */
export function FreeQuotaMeterLine() {
  const { usage } = useDashboardData();
  if (usage.unlimited || usage.remainingToday == null) return null;

  const limit = usage.dailyLimit ?? 3;
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

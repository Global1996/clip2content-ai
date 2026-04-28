"use client";

import Link from "next/link";
import { useDashboardData } from "@/components/dashboard/dashboard-context";
import { UpgradeToProLink } from "@/components/dashboard/upgrade-conversion";

export function BrandVoiceClient() {
  const { usage } = useDashboardData();
  const locked = !usage.unlimited;

  return (
    <div className="relative mx-auto max-w-3xl space-y-6 pb-16 lg:pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Brand Voice
        </h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-zinc-400">
          Train Virlo on how you speak — vocabulary rules, banned phrases, and examples —
          rolling out soon.
        </p>
      </div>

      <div
        className={
          locked
            ? "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827]/80"
            : "rounded-2xl border border-white/[0.08] bg-[#111827]/80"
        }
      >
        <div
          className={
            locked
              ? "pointer-events-none select-none px-8 py-14 blur-[7px]"
              : "px-8 py-14"
          }
        >
          <p className="text-center text-sm leading-relaxed text-zinc-400">
            Voice presets, lexicon controls, and tone sliders — preview builds next.
          </p>
        </div>

        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0B0F19]/55 px-6 text-center backdrop-blur-[2px]">
            <p className="max-w-xs text-sm font-medium leading-relaxed text-white">
              Brand Voice is a Pro workspace — unlock unlimited generations and early access.
            </p>
            <UpgradeToProLink size="sm" className="shadow-lg">
              Upgrade to Pro
            </UpgradeToProLink>
            <Link
              href="/pricing"
              className="text-xs font-medium text-zinc-500 underline-offset-4 hover:text-zinc-400 hover:underline"
            >
              Compare plans
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

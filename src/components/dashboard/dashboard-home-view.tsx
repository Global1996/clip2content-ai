"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DashboardStatsGrid } from "@/components/dashboard/dashboard-stats-grid";
import { GenerationWorkspace } from "@/components/dashboard/generation-workspace";
import { RecentGenerationRows } from "@/components/dashboard/recent-generation-rows";
import { FreeQuotaMeterLine } from "@/components/dashboard/upgrade-conversion";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.02 },
  },
};

const sectionItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
};

function SectionRule() {
  return (
    <div
      role="presentation"
      aria-hidden
      className="dash-section-rule shrink-0 opacity-90"
    />
  );
}

export function DashboardHomeView({ displayName }: { displayName: string }) {
  const prefersReducedMotion = useReducedMotion();
  const first =
    displayName.trim().split(/\s+/)[0] || displayName.trim() || "there";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-5xl flex-col gap-10 pb-[max(5rem,env(safe-area-inset-bottom))] sm:gap-12 lg:gap-14 lg:pb-24 xl:gap-16"
    >
      <motion.section variants={sectionItem} className="flex flex-col gap-2.5 sm:gap-3">
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-tight text-white">
          Welcome back, {first}{" "}
          {prefersReducedMotion ? (
            <span aria-hidden className="inline-block">
              👋
            </span>
          ) : (
            <motion.span
              aria-hidden
              className="inline-block origin-[70%_70%]"
              initial={{ rotate: 0, scale: 1 }}
              animate={{ rotate: [0, 14, -8, 12, 0], scale: [1, 1.08, 1] }}
              transition={{
                duration: 1.25,
                delay: 0.45,
                ease,
              }}
            >
              👋
            </motion.span>
          )}
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed tracking-tight text-zinc-400 md:text-base">
          Turn ideas into viral content in seconds
        </p>
      </motion.section>

      <motion.div variants={sectionItem} className="w-full space-y-5">
        <DashboardStatsGrid />
        <FreeQuotaMeterLine />
      </motion.div>

      <SectionRule />

      <motion.section
        variants={sectionItem}
        className="flex flex-col gap-7 scroll-mt-10 sm:scroll-mt-12"
      >
        <header className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Generator
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Content generator
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
              Describe your idea — get hooks, scripts, captions, and posts.
            </p>
          </div>
        </header>
        <GenerationWorkspace showHeading={false} />
      </motion.section>

      <SectionRule />

      <motion.section
        variants={sectionItem}
        className="flex flex-col gap-7 scroll-mt-10 sm:scroll-mt-12"
      >
        <header className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Activity
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Recent generations
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
              Copy packs or expand to review full output.
            </p>
          </div>
        </header>
        <RecentGenerationRows limit={5} />
      </motion.section>
    </motion.div>
  );
}

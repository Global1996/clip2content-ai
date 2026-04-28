"use client";

import { motion } from "framer-motion";

/** Static preview — illustrates output structure (not live AI). */
export function LandingDemo() {
  return (
    <section
      id="demo"
      className="scroll-mt-24 border-y border-border-subtle bg-background/50 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl lg:max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Preview
          </p>
          <h2 className="mt-4 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-tight text-foreground">
            From one topic to a full content pack
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Here&apos;s what a generation looks like — organized sections you can copy in one tap.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-3xl rounded-2xl border border-border-subtle bg-surface shadow-soft-lg"
        >
          <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3 sm:px-5">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/40" />
              <span className="h-3 w-3 rounded-full bg-amber-500/40" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/40" />
            </div>
            <span className="ml-2 truncate text-[11px] text-muted">
              virlo.app/dashboard/generate
            </span>
          </div>

          <div className="p-4 sm:p-6">
            <div className="rounded-xl border border-border-subtle bg-background/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                Topic
              </p>
              <p className="mt-2 text-sm font-medium text-foreground sm:text-base">
                Why cold showers don&apos;t fix your discipline (and what does)
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <PreviewBlock
                label="Hooks"
                badge="5"
                lines={[
                  "POV: You finally admit the routine broke you",
                  "Nobody tells you this about discipline hacks…",
                  "I tried the trend for 14 days — here’s the truth",
                ]}
              />
              <PreviewBlock
                label="Scripts"
                badge="3"
                lines={[
                  "~30s beats: hook → story → CTA",
                  "Alternate angle: contrarian take",
                  "Trend remix + stitch-ready closer",
                ]}
              />
              <PreviewBlock
                label="Caption & posts"
                badge="6"
                lines={[
                  "One caption with emojis on-brand",
                  "Five stagger-ready posts for feeds",
                ]}
              />
            </div>

            <p className="mt-6 text-center text-xs text-muted">
              Real runs include full copy for every section — this is a layout preview only.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PreviewBlock({
  label,
  badge,
  lines,
}: {
  label: string;
  badge: string;
  lines: string[];
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-background/30 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          {label}
        </span>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium tabular-nums text-primary">
          {badge}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {lines.map((line) => (
          <li
            key={line}
            className="rounded-lg bg-surface/80 px-2.5 py-2 text-[11px] leading-snug text-muted sm:text-xs"
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DEMO_PRESETS, type DemoPresetId } from "@/components/landing/demo-presets";

const IDS = Object.keys(DEMO_PRESETS) as DemoPresetId[];

export function LandingTemplates() {
  return (
    <section
      id="templates"
      className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl lg:max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Templates
          </p>
          <h2 className="mt-4 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-tight text-foreground">
            Start from a proven content type
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Pick a template — we&apos;ll drop a strong seed topic into the live demo. Tune it, generate,
            and copy what lands.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IDS.map((id, i) => {
            const t = DEMO_PRESETS[id];
            return (
              <motion.li
                key={id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href={`/?preset=${id}#live-demo`}
                  scroll
                  className="group flex h-full flex-col rounded-2xl border border-border-subtle bg-surface/80 p-5 shadow-soft transition hover:border-primary/35 hover:shadow-glow active:scale-[0.99] sm:p-6"
                >
                  <span className="text-2xl" aria-hidden>
                    {t.emoji}
                  </span>
                  <span className="mt-3 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">
                    {t.label}
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {t.blurb}
                  </span>
                  <span className="mt-4 text-sm font-semibold text-primary">
                    Try in live demo →
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

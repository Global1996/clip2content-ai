"use client";

import { motion } from "framer-motion";

export function LandingSocialProof() {
  return (
    <section
      aria-label="Social proof"
      className="border-y border-border-subtle bg-surface/60 px-4 py-8 sm:px-6 md:px-8"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-12 lg:gap-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-[clamp(1.125rem,2.5vw,1.35rem)] font-semibold tracking-tight text-foreground"
        >
          Used by <span className="gradient-text">1000+ creators</span> to ship content faster
        </motion.p>
        <div className="hidden h-10 w-px bg-border-subtle sm:block" aria-hidden />
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
            Hooks &amp; scripts in one run
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/90 shadow-[0_0_12px_rgba(34,211,238,0.45)]" />
            Built for short-form
          </li>
        </ul>
      </div>
    </section>
  );
}

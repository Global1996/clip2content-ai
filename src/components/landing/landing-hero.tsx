"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function LandingHero() {
  return (
    <section className="relative overflow-hidden mesh-bg px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 md:px-8 md:pb-32 md:pt-24 lg:pb-40 lg:pt-32">
      <div className="mx-auto max-w-4xl text-center lg:max-w-5xl">
        <motion.p
          custom={0}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted shadow-soft backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_14px_rgba(34,211,238,0.65)]" />
          Virlo
        </motion.p>
        <motion.h1
          custom={1}
          variants={fade}
          initial="hidden"
          animate="show"
          className="text-[clamp(2rem,6vw,3.75rem)] font-semibold leading-[1.08] tracking-tight text-foreground"
        >
          Go Viral in Minutes —{" "}
          <span className="gradient-text">Not Hours</span>
        </motion.h1>
        <motion.p
          custom={2}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-lg"
        >
          One topic becomes hooks, speak-ready scripts, captions, and feed posts — structured so you can record,
          post, and iterate today instead of fighting the blank page.
        </motion.p>
        <motion.div
          custom={3}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-10 flex flex-col items-center gap-4 sm:mt-12"
        >
          <Link
            href="/register"
            className="touch-manipulation inline-flex min-h-[56px] w-full max-w-md items-center justify-center rounded-2xl bg-primary px-10 text-base font-semibold text-white shadow-glow transition duration-200 hover:brightness-110 active:scale-[0.98] sm:min-h-[52px] sm:text-lg"
          >
            Try Free
          </Link>
          <p className="text-center text-sm text-muted">
            <span className="font-medium text-foreground/90">
              No credit card required
            </span>
            {" · "}
            Live demo below — generate without logging in.
          </p>
          <Link
            href="#live-demo"
            className="touch-manipulation text-base font-semibold text-primary/90 underline-offset-4 transition hover:text-primary hover:underline sm:text-[17px]"
          >
            Try the live demo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

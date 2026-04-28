"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function LandingCta() {
  return (
    <section className="px-4 pb-[max(5rem,env(safe-area-inset-bottom))] pt-8 sm:px-6 sm:pb-28 md:px-8 md:pb-36 lg:pb-44">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-soft-lg lg:max-w-7xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_80%_-10%,rgba(91,140,255,0.14),transparent),radial-gradient(ellipse_60%_60%_at_10%_110%,rgba(124,242,156,0.08),transparent)]"
        />
        <div className="relative px-6 py-14 text-center sm:px-12 sm:py-16 md:px-16 md:py-20 lg:px-20 lg:py-24">
          <h2 className="text-[clamp(1.625rem,4vw,2.75rem)] font-semibold tracking-tight text-foreground">
            Ready to ship your next viral angle?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted sm:mt-6 sm:text-lg">
            Join free — Virlo turns your first topic into a full pack in under a minute.
          </p>
          <Link
            href="/register"
            className="touch-manipulation mt-8 inline-flex min-h-[52px] w-full max-w-sm items-center justify-center rounded-2xl bg-primary px-10 text-base font-semibold text-white shadow-glow transition duration-200 hover:brightness-110 active:scale-[0.98] sm:mt-10 sm:text-lg"
          >
            Try Virlo Free
          </Link>
          <p className="mt-5 text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </section>
  );
}

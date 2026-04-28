"use client";

import { motion } from "framer-motion";

const items = [
  {
    title: "Hooks",
    body: "Scroll-stopping openers tuned for TikTok, Reels, and Shorts — pick one and hit record.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Scripts",
    body: "Three tight ~30s scripts with beats and lines — read or riff, you’re never starting from zero.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Captions",
    body: "One caption with the right tone and emojis — save-for-posting, not generic filler.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
  },
  {
    title: "Posts",
    body: "Five feed-ready posts — angles you can stagger across platforms without repeating yourself.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-16 sm:scroll-mt-28 sm:px-6 sm:py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl lg:max-w-7xl">
        <div className="mb-12 max-w-2xl md:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            What you get
          </p>
          <h2 className="mt-4 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-tight text-foreground">
            Everything in one structured pack
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            One topic in — a full short-form bundle out. Built for creators who ship fast.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {items.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="card-premium group flex flex-col p-6 sm:p-7 hover:border-primary/25 hover:bg-surface-elevated"
            >
              <div className="mb-5 inline-flex rounded-2xl bg-primary/12 p-4 text-primary ring-1 ring-primary/15 transition duration-300 group-hover:bg-primary/18">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">
                {item.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

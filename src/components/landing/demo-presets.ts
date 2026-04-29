/** URL preset IDs → seed topics for the anonymous live demo (`/?preset=id#live-demo`). */
export const DEMO_PRESETS = {
  story: {
    label: "Story / transformation",
    emoji: "📖",
    blurb: "Before → after arcs that keep viewers watching.",
    topic:
      "How I went from burnt out to posting daily without losing my sanity — one rule that changed everything",
  },
  hot_take: {
    label: "Hot take",
    emoji: "🔥",
    blurb: "Contrarian angles engineered to spark comments.",
    topic:
      "Unpopular opinion: productivity hacks are making you slower — here’s what actually works in 2026",
  },
  tutorial: {
    label: "Tutorial / tips",
    emoji: "✅",
    blurb: "Step-by-step value clips people save and share.",
    topic:
      "5 editing tricks that make talking-head videos look expensive (even on a phone)",
  },
  product: {
    label: "Product launch",
    emoji: "🚀",
    blurb: "Proof-first framing for launches and demos.",
    topic:
      "Soft-launching my new creator toolkit — the features I wish existed when I started",
  },
  lifestyle: {
    label: "Lifestyle / routine",
    emoji: "☀️",
    blurb: "Relatable routines with a sharp hook.",
    topic:
      "My realistic morning routine as a full-time creator — not aesthetic, just what moves the needle",
  },
  trending: {
    label: "Trend remix",
    emoji: "⚡",
    blurb: "Trend-native hooks with your niche baked in.",
    topic:
      "This viral sound but for people who are tired of hustle culture — stitched with receipts",
  },
} as const;

export type DemoPresetId = keyof typeof DEMO_PRESETS;

export function isDemoPresetId(id: string): id is DemoPresetId {
  return id in DEMO_PRESETS;
}

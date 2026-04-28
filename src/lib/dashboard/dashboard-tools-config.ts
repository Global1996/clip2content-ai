import type { EmphasisOption } from "@/lib/dashboard/generation-meta";

export type DashboardToolSlug =
  | "hook-generator"
  | "caption-generator"
  | "hashtag-generator"
  | "idea-generator"
  | "script-generator";

export const DASHBOARD_TOOLS: Record<
  DashboardToolSlug,
  {
    title: string;
    shortTitle: string;
    emphasis: EmphasisOption;
    description: string;
  }
> = {
  "hook-generator": {
    title: "Hook Generator",
    shortTitle: "Hook Generator",
    emphasis: "hooks",
    description: "Scroll-stopping hooks for your niche.",
  },
  "caption-generator": {
    title: "Caption Generator",
    shortTitle: "Caption Generator",
    emphasis: "caption",
    description: "One high-engagement caption with emojis.",
  },
  "hashtag-generator": {
    title: "Hashtag Generator",
    shortTitle: "Hashtag Generator",
    emphasis: "hashtags",
    description: "Post lines tuned for hashtag discovery.",
  },
  "idea-generator": {
    title: "Idea Generator",
    shortTitle: "Idea Generator",
    emphasis: "ideas",
    description: "Angles as hooks + punchy social posts.",
  },
  "script-generator": {
    title: "Script Generator",
    shortTitle: "Script Generator",
    emphasis: "scripts",
    description: "Speakable short-form scripts.",
  },
};

export function isDashboardToolSlug(s: string): s is DashboardToolSlug {
  return s in DASHBOARD_TOOLS;
}

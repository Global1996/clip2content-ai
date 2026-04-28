/** Client + server shared generation options (API body). */
export const TONE_OPTIONS = [
  "Engaging",
  "Professional",
  "Funny",
  "Aggressive",
] as const;
export type ToneOption = (typeof TONE_OPTIONS)[number];

export const PLATFORM_OPTIONS = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
] as const;

export const LANGUAGE_OPTIONS = [
  { id: "en", label: "English" },
  { id: "es", label: "Spanish" },
  { id: "fr", label: "French" },
  { id: "de", label: "German" },
  { id: "ro", label: "Romanian" },
  { id: "pt", label: "Portuguese" },
] as const;

export const LENGTH_OPTIONS = [
  { id: "short", label: "Short" },
  { id: "medium", label: "Medium" },
  { id: "long", label: "Long" },
] as const;

/** Which part of the pack to emphasize in copy; model still returns full JSON. */
export type EmphasisOption =
  | "full"
  | "hooks"
  | "scripts"
  | "caption"
  | "posts"
  | "ideas"
  | "hashtags";

export type GenerationOptionsPayload = {
  tone: string;
  platform: string;
  language: string;
  length: "short" | "medium" | "long";
  emphasis: EmphasisOption;
};

export const DEFAULT_GENERATION_OPTIONS: GenerationOptionsPayload = {
  tone: "Engaging",
  platform: "tiktok",
  language: "en",
  length: "medium",
  emphasis: "full",
};

export function emphasisInstruction(e: EmphasisOption): string {
  switch (e) {
    case "hooks":
      return "Prioritize exceptional, scroll-stopping hooks; other fields still required but hooks are the hero.";
    case "scripts":
      return "Prioritize tight, speakable scripts for the platform; hooks can be simpler.";
    case "caption":
      return "Prioritize one killer caption with strong emojis and CTA.";
    case "posts":
      return "Prioritize punchy standalone posts / thread beats.";
    case "ideas":
      return "Prioritize novel angles and brainstorm-style hooks + post ideas.";
    case "hashtags":
      return "Ensure posts lean hashtag-ready (mix branded + niche tags where fitting).";
    default:
      return "Balance quality across hooks, scripts, caption, and posts.";
  }
}

/** Builds the stored topic string + AI prompt prefix (deterministic). */
export function composeGenerationPrompt(
  rawTopic: string,
  opts: GenerationOptionsPayload
): string {
  const topic = rawTopic.trim();
  const lines = [
    `Tone: ${opts.tone}.`,
    `Primary platform: ${opts.platform}.`,
    `Language: ${opts.language}.`,
    `Length preference: ${opts.length}.`,
    emphasisInstruction(opts.emphasis),
    "",
    "Topic:",
    topic,
  ];
  return lines.join("\n");
}

const EMPHASIS_WHITELIST = new Set<EmphasisOption>([
  "full",
  "hooks",
  "scripts",
  "caption",
  "posts",
  "ideas",
  "hashtags",
]);

export function mergeGenerationOptions(
  partial: Partial<GenerationOptionsPayload> | null | undefined
): GenerationOptionsPayload {
  const d = DEFAULT_GENERATION_OPTIONS;
  if (!partial || typeof partial !== "object") return { ...d };
  const emphasis: EmphasisOption =
    typeof partial.emphasis === "string" &&
    EMPHASIS_WHITELIST.has(partial.emphasis as EmphasisOption)
      ? (partial.emphasis as EmphasisOption)
      : d.emphasis;
  const length =
    partial.length === "short" ||
    partial.length === "medium" ||
    partial.length === "long"
      ? partial.length
      : d.length;

  return {
    tone:
      typeof partial.tone === "string" && partial.tone.trim()
        ? partial.tone.trim()
        : d.tone,
    platform:
      typeof partial.platform === "string" && partial.platform.trim()
        ? partial.platform.trim().toLowerCase()
        : d.platform,
    language:
      typeof partial.language === "string" && partial.language.trim()
        ? partial.language.trim().toLowerCase()
        : d.language,
    length,
    emphasis,
  };
}

export function parseGenerationOptionsFromBody(body: unknown): GenerationOptionsPayload {
  if (!body || typeof body !== "object") return { ...DEFAULT_GENERATION_OPTIONS };
  const o = body as Record<string, unknown>;
  const opt = o.options;
  if (!opt || typeof opt !== "object") return { ...DEFAULT_GENERATION_OPTIONS };
  return mergeGenerationOptions(opt as Partial<GenerationOptionsPayload>);
}

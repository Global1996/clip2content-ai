import type { SupabaseClient } from "@supabase/supabase-js";

/** Persisted on completion via Supabase `auth.updateUser({ data })`. */
export const ONBOARDING_METADATA_KEY = "virlo_onboarding_done" as const;

export type OnboardingNicheId = "business" | "fitness" | "real_estate" | "other";

export type OnboardingPlatformId = "tiktok" | "instagram" | "youtube";

export const ONBOARDING_PLATFORMS: {
  id: OnboardingPlatformId;
  label: string;
}[] = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
];

export const ONBOARDING_NICHES: {
  id: OnboardingNicheId;
  label: string;
}[] = [
  { id: "business", label: "Business" },
  { id: "fitness", label: "Fitness" },
  { id: "real_estate", label: "Real Estate" },
  { id: "other", label: "Other" },
];

/** Example prompts tuned per niche — paired with platform in generation options. */
export const ONBOARDING_TOPIC_BY_NICHE: Record<OnboardingNicheId, string> = {
  business:
    "Why most founders confuse hustle with leverage — one mindset shift before your next quarterly push that actually moves revenue.",
  fitness:
    "Why rest days aren't lazy — what's actually happening when you skip the gym to recover (and how to post about it without sounding basic).",
  real_estate:
    "First-time buyers miss this open-house red flag — three questions that save your deposit before you fall in love with the staging.",
  other:
    "Why your first week on a new habit feels chaotic — one mindset shift that keeps you consistent without burning out.",
};

/**
 * First-time creators with zero generations see onboarding unless explicitly marked done.
 * Anyone with ≥1 generation skips (covers legacy users without metadata).
 */
export async function needsOnboarding(
  supabase: SupabaseClient,
  userId: string,
  metadata: Record<string, unknown> | undefined
): Promise<boolean> {
  if (metadata?.[ONBOARDING_METADATA_KEY] === true) return false;

  const { count, error } = await supabase
    .from("generations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) return false;
  return (count ?? 0) === 0;
}

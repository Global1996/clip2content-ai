import type { FavoriteRow } from "@/types/favorites";

/** Deep-link into Generate with the saved topic + platform preset. */
export function favoriteRegenerateHref(
  f: Pick<FavoriteRow, "topic_snapshot" | "title" | "platform">
): string {
  const seed = (f.topic_snapshot ?? f.title).trim() || f.title.trim();
  const platform = (f.platform || "tiktok").trim().toLowerCase();
  return `/dashboard/generate?seed_topic=${encodeURIComponent(seed)}&seed_platform=${encodeURIComponent(platform)}`;
}

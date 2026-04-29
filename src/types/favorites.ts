import type { ContentOutput } from "@/types/content";

export type FavoriteContentType =
  | "hook"
  | "caption"
  | "script"
  | "idea"
  | "full_pack";

export type FavoritePlatform =
  | "tiktok"
  | "instagram"
  | "youtube"
  | "linkedin"
  | "x";

export type FavoriteRow = {
  id: string;
  user_id: string;
  title: string;
  topic_snapshot: string | null;
  output: ContentOutput;
  content_type: FavoriteContentType;
  platform: string;
  tags: string[];
  usage_count: number;
  source_generation_id: string | null;
  created_at: string;
  updated_at: string;
};

export type FavoriteSort = "newest" | "oldest" | "most_used";

export type FavoritesStatsPayload = {
  total: number;
  thisMonth: number;
  byType: Record<string, number>;
  byPlatform: Record<string, number>;
  /** Unique tags across all favorites (for filter chips). */
  availableTags: string[];
};

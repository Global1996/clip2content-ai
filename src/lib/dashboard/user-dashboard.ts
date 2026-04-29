import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_DAILY_GENERATION_LIMIT } from "@/lib/billing/constants";
import {
  countGenerationsTodayUtc,
  getUserPlan,
} from "@/lib/billing/entitlements";

export type UsagePayload = {
  plan: string;
  unlimited: boolean;
  generationsTodayUtc: number;
  dailyLimit: number | null;
  remainingToday: number | null;
};

/** Parallel DB reads — faster than chaining sequential awaits. */
export async function buildUsagePayload(
  supabase: SupabaseClient,
  userId: string
): Promise<UsagePayload> {
  const [plan, usedToday] = await Promise.all([
    getUserPlan(supabase, userId),
    countGenerationsTodayUtc(supabase, userId),
  ]);

  const unlimited = plan === "pro" || plan === "lifetime";

  return {
    plan,
    unlimited,
    generationsTodayUtc: usedToday,
    dailyLimit: unlimited ? null : FREE_DAILY_GENERATION_LIMIT,
    remainingToday: unlimited
      ? null
      : Math.max(0, FREE_DAILY_GENERATION_LIMIT - usedToday),
  };
}

export type DashboardStats = {
  totalGenerations: number;
  thisMonthCount: number;
  monthGrowthPercent: number | null;
  favoritesCount: number;
};

export type DashboardPayload = {
  usage: UsagePayload;
  stats: DashboardStats;
  items: {
    id: string;
    topic: string;
    output: unknown;
    created_at: string;
  }[];
};

/** Generation counts for stats cards (parallel count queries). */
export async function buildDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardStats> {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const startThisMonth = new Date(Date.UTC(y, m, 1)).toISOString();
  const startLastMonth = new Date(Date.UTC(y, m - 1, 1)).toISOString();
  const endLastMonth = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999)).toISOString();

  const [totalRes, thisMonthRes, lastMonthRes] = await Promise.all([
    supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startThisMonth),
    supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startLastMonth)
      .lte("created_at", endLastMonth),
  ]);

  const totalGenerations = totalRes.count ?? 0;
  const thisMonthCount = thisMonthRes.count ?? 0;
  const lastMonthCount = lastMonthRes.count ?? 0;

  let monthGrowthPercent: number | null = null;
  if (lastMonthCount > 0) {
    monthGrowthPercent =
      Math.round(
        ((thisMonthCount - lastMonthCount) / lastMonthCount) * 1000
      ) / 10;
  } else if (thisMonthCount > 0) {
    monthGrowthPercent = 100;
  }

  const favRes = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (favRes.error && process.env.NODE_ENV === "development") {
    console.warn("[buildDashboardStats] favorites count:", favRes.error.message);
  }

  const favoritesCount =
    !favRes.error && typeof favRes.count === "number" ? favRes.count : 0;

  return {
    totalGenerations,
    thisMonthCount,
    monthGrowthPercent,
    favoritesCount,
  };
}

export async function fetchGenerationHistory(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardPayload["items"]> {
  const { data, error } = await supabase
    .from("generations")
    .select("id, topic, output, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as DashboardPayload["items"];
}

/** Parallel usage + history for one API round-trip. */
export async function loadUserDashboard(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardPayload> {
  const [usage, items, stats] = await Promise.all([
    buildUsagePayload(supabase, userId),
    fetchGenerationHistory(supabase, userId),
    buildDashboardStats(supabase, userId),
  ]);

  return {
    usage,
    stats,
    items,
  };
}

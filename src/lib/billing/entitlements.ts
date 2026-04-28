import type { SupabaseClient } from "@supabase/supabase-js";
import {
  FREE_DAILY_GENERATION_LIMIT,
  type BillingPlan,
} from "@/lib/billing/constants";

/** PostgrestError often prints as `{}` in console — log fields explicitly. */
function logPostgrestError(context: string, err: unknown) {
  if (process.env.NODE_ENV !== "development") return;
  if (err && typeof err === "object") {
    const o = err as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };
    console.warn(`[${context}]`, {
      message: o.message,
      code: o.code,
      details: o.details,
      hint: o.hint,
    });
    return;
  }
  console.warn(`[${context}]`, err);
}

/** Ensures a row exists for signed-up users who predated migration / missed trigger. */
async function ensureFreeEntitlementRow(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_entitlements")
    .insert({ user_id: userId, plan: "free" });

  if (!error) return;

  /* Postgres unique_violation — row already exists (race / backfill). */
  const code = error.code != null ? String(error.code) : "";
  const msg = error.message ?? "";
  if (code === "23505" || /duplicate key/i.test(msg)) return;

  logPostgrestError("ensureFreeEntitlementRow", error);
}

export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<BillingPlan> {
  const { data: rows, error } = await supabase
    .from("user_entitlements")
    .select("plan")
    .eq("user_id", userId)
    .limit(1);

  if (error) {
    logPostgrestError("getUserPlan.select", error);
    return "free";
  }

  const row = rows?.[0];
  if (!row) {
    await ensureFreeEntitlementRow(supabase, userId);
    const { data: retry, error: retryErr } = await supabase
      .from("user_entitlements")
      .select("plan")
      .eq("user_id", userId)
      .limit(1);
    if (retryErr) {
      logPostgrestError("getUserPlan.retry", retryErr);
      return "free";
    }
    const p2 = retry?.[0]?.plan;
    if (p2 === "pro" || p2 === "lifetime" || p2 === "free") return p2;
    return "free";
  }

  const p = row.plan;
  if (p === "pro" || p === "lifetime" || p === "free") return p;
  return "free";
}

/** Start of current UTC day (matches daily reset in product copy). */
export function startOfUtcDayIso(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function countGenerationsTodayUtc(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("generations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfUtcDayIso());

  if (error) {
    logPostgrestError("countGenerationsTodayUtc", error);
    return 0;
  }
  return count ?? 0;
}

export type GenerationGate =
  | { allowed: true; plan: BillingPlan; unlimited: true }
  | {
      allowed: true;
      plan: "free";
      unlimited: false;
      usedToday: number;
      dailyLimit: number;
    }
  | {
      allowed: false;
      plan: "free";
      unlimited: false;
      usedToday: number;
      dailyLimit: number;
      reason: "DAILY_LIMIT";
    };

export async function gateGenerationForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<GenerationGate> {
  const plan = await getUserPlan(supabase, userId);

  if (plan === "pro" || plan === "lifetime") {
    return { allowed: true, plan, unlimited: true };
  }

  const usedToday = await countGenerationsTodayUtc(supabase, userId);

  if (usedToday >= FREE_DAILY_GENERATION_LIMIT) {
    return {
      allowed: false,
      plan: "free",
      unlimited: false,
      usedToday,
      dailyLimit: FREE_DAILY_GENERATION_LIMIT,
      reason: "DAILY_LIMIT",
    };
  }

  return {
    allowed: true,
    plan: "free",
    unlimited: false,
    usedToday,
    dailyLimit: FREE_DAILY_GENERATION_LIMIT,
  };
}

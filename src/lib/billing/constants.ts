/** Free plan: this many generations per UTC day; next attempt is blocked until upgrade or next UTC day. */
export const FREE_DAILY_GENERATION_LIMIT = 2;

export type BillingPlan = "free" | "pro" | "lifetime";

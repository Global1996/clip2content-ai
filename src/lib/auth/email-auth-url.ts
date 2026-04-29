import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";

/**
 * Origin embedded in Supabase confirmation / magic-link emails.
 * In production set `NEXT_PUBLIC_APP_URL` to your canonical site URL (same as Supabase “Site URL”)
 * so links in emails match allowed redirect URLs. On localhost the browser origin is used.
 */
export function resolveAuthRedirectOrigin(): string {
  if (typeof window === "undefined") return "";

  const fromBrowser = window.location.origin;
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ?? "";

  if (!fromEnv) return fromBrowser;

  try {
    const hostBrowser = new URL(fromBrowser).hostname;
    const hostEnv = new URL(fromEnv).hostname;
    if (hostBrowser === hostEnv) return fromEnv;
  } catch {
    return fromBrowser;
  }

  return fromBrowser;
}

/** Matches `/auth/callback` exchange URL used by signUp, signInWithOtp, and auth.resend. */
export function buildAuthCallbackUrl(
  origin: string,
  redirectCandidate: string | null | undefined
): string {
  const next = getSafeRedirectPath(redirectCandidate);
  const base = origin.replace(/\/$/, "");
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}

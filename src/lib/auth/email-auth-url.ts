import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";

/** Matches `/auth/callback` exchange URL used by signUp, signInWithOtp, and auth.resend. */
export function buildAuthCallbackUrl(
  origin: string,
  redirectCandidate: string | null | undefined
): string {
  const next = getSafeRedirectPath(redirectCandidate);
  const base = origin.replace(/\/$/, "");
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}

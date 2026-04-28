/**
 * Prevent open redirects: only same-origin relative paths are allowed.
 */
export function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (candidate == null || candidate === "") return fallback;
  const t = candidate.trim();
  if (t.length > 2048) return fallback;
  if (!t.startsWith("/")) return fallback;
  if (t.startsWith("//")) return fallback;
  if (t.includes("\\")) return fallback;
  return t;
}

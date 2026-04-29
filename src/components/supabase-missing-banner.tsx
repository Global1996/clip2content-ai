/**
 * Shown when NEXT_PUBLIC_SUPABASE_* were missing at build time (e.g. Vercel env not set).
 * Variable names must match exactly: NEXT_PUBLIC_SUPABASE_ANON_KEY (not ANOM or ANON typo in dashboard).
 */
export function SupabaseMissingBanner() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (url && anonKey) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-[100] border-b border-red-800 bg-red-950 px-4 py-3 text-center text-[13px] leading-snug text-red-50"
    >
      <strong className="font-semibold">Supabase nu e configurat în acest build.</strong>{" "}
      Adaugă în Vercel → Settings → Environment Variables (Production + Preview):{" "}
      <code className="rounded bg-red-900/80 px-1 py-0.5 font-mono text-[12px]">
        NEXT_PUBLIC_SUPABASE_URL
      </code>{" "}
      și{" "}
      <code className="rounded bg-red-900/80 px-1 py-0.5 font-mono text-[12px]">
        NEXT_PUBLIC_SUPABASE_ANON_KEY
      </code>{" "}
      (cheia „anon” din Supabase → Settings → API). Apoi{" "}
      <strong>Redeploy</strong> — variabilele NEXT_PUBLIC_* se înglobează la build.
    </div>
  );
}

/** Validates public Supabase env used by browser + server SSR clients (inlined at build for NEXT_PUBLIC_*). */
export function assertPublicSupabaseEnv(scope: string): {
  url: string;
  anonKey: string;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      `[Virlo:${scope}] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ` +
        `Local: copy .env.example → .env.local and fill values. ` +
        `Vercel: Project → Settings → Environment Variables (Production + Preview), then Redeploy — NEXT_PUBLIC_* are embedded at build time.`
    );
  }

  return { url, anonKey };
}

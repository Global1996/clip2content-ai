import { createBrowserClient } from "@supabase/ssr";

import { assertPublicSupabaseEnv } from "@/lib/supabase/public-env";

export function createClient() {
  const { url, anonKey } = assertPublicSupabaseEnv("browser");
  return createBrowserClient(url, anonKey);
}

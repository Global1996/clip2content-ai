"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { VirloWordmark } from "@/components/brand/virlo-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type AppHeaderProps = {
  email: string | null;
};

export function AppHeader({ email }: AppHeaderProps) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const shortEmail =
    email && email.length > 28 ? `${email.slice(0, 14)}…${email.slice(-10)}` : email;

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex min-h-14 max-w-6xl flex-col gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:h-[60px] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0 sm:pl-6 sm:pr-6 lg:max-w-7xl lg:px-8">
        <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start sm:gap-6">
          <VirloWordmark
            href="/dashboard"
            className="touch-manipulation shrink-0"
            size="md"
          />
          {email && (
            <span
              className="hidden min-w-0 max-w-[min(100%,14rem)] truncate text-xs text-muted sm:inline md:max-w-xs"
              title={email}
            >
              {shortEmail}
            </span>
          )}
        </div>
        <div className="flex w-full shrink-0 items-center justify-stretch gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <ThemeToggle className="inline-flex shrink-0" />
          <Link
            href="/"
            className="touch-manipulation inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground sm:flex-none sm:px-3 sm:py-2"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="touch-manipulation inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface sm:flex-none sm:px-4 sm:py-2"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckEmailPanel } from "@/components/auth/check-email-panel";
import { InlineSpinner } from "@/components/auth/inline-spinner";
import { useResendCooldown } from "@/hooks/use-resend-cooldown";
import { buildAuthCallbackUrl, resolveAuthRedirectOrigin } from "@/lib/auth/email-auth-url";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { VirloWordmark } from "@/components/brand/virlo-logo";

type LoginMode = "password" | "magic";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = getSafeRedirectPath(searchParams.get("redirect"));
  const err = searchParams.get("error");

  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    err === "auth" ? "Authentication failed." : null
  );
  const [awaitingMagicLink, setAwaitingMagicLink] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const { secondsLeft, startCooldown, canResend } = useResendCooldown(30);

  const queryString = searchParams.toString();
  const registerHref = queryString ? `/register?${queryString}` : "/register";

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  async function executeMagicLink(fromResend: boolean) {
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!fromResend && magicLoading) return;
    if (fromResend && (!canResend || resendLoading)) return;

    if (fromResend) setResendLoading(true);
    else setMagicLoading(true);
    setErrorMsg(null);

    const origin = resolveAuthRedirectOrigin();

    const supabase = createClient();
    const emailRedirectTo =
      origin && redirect ? buildAuthCallbackUrl(origin, redirect) : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo,
        shouldCreateUser: false,
      },
    });

    if (fromResend) setResendLoading(false);
    else setMagicLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }
    if (!fromResend) setAwaitingMagicLink(true);
    startCooldown();
  }

  async function onMagicSubmit(e: React.FormEvent) {
    e.preventDefault();
    await executeMagicLink(false);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-border-subtle bg-surface px-4 py-3.5 text-base text-foreground placeholder:text-muted/70 outline-none transition duration-200 focus:border-primary/45 focus:ring-2 focus:ring-primary/15 md:text-[15px]";

  function switchMode(next: LoginMode) {
    setMode(next);
    setErrorMsg(null);
  }

  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16 md:px-8">
      <VirloWordmark href="/" className="mb-12" />
      <div className="w-full max-w-[440px] rounded-2xl border border-border-subtle bg-surface/90 p-6 shadow-soft-lg backdrop-blur-md sm:p-10">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="mt-3 text-center text-[15px] leading-relaxed text-muted">
          Password or magic link — same secure inbox delivery.
        </p>

        {awaitingMagicLink ? (
          <div className="mt-10 flex flex-col gap-6">
            <CheckEmailPanel
              email={email.trim()}
              hint="We sent a magic link to"
              onResend={() => void executeMagicLink(true)}
              resendLoading={resendLoading || magicLoading}
              canResend={canResend}
              secondsUntilResend={secondsLeft}
            />
            {errorMsg ? (
              <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
                {errorMsg}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setAwaitingMagicLink(false);
                setErrorMsg(null);
              }}
              className="text-center text-[15px] font-semibold text-primary transition hover:text-primary/85"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <div
              className="mt-8 grid grid-cols-2 gap-1 rounded-xl border border-border-subtle bg-background/40 p-1"
              role="tablist"
              aria-label="Sign-in method"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "password"}
                onClick={() => switchMode("password")}
                className={cn(
                  "touch-manipulation rounded-lg py-2.5 text-sm font-semibold transition",
                  mode === "password"
                    ? "bg-surface text-foreground shadow-soft"
                    : "text-muted hover:text-foreground/90"
                )}
              >
                Password
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "magic"}
                onClick={() => switchMode("magic")}
                className={cn(
                  "touch-manipulation rounded-lg py-2.5 text-sm font-semibold transition",
                  mode === "magic"
                    ? "bg-surface text-foreground shadow-soft"
                    : "text-muted hover:text-foreground/90"
                )}
              >
                Magic link
              </button>
            </div>

            {mode === "password" ? (
              <form onSubmit={onPasswordSubmit} className="mt-8 flex flex-col gap-5">
                <div>
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wider text-muted"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-wider text-muted"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                {errorMsg ? (
                  <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {errorMsg}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="touch-manipulation mt-2 flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-[15px] font-semibold text-white shadow-glow transition duration-200 hover:brightness-110 disabled:pointer-events-none disabled:opacity-55"
                >
                  {loading ? (
                    <>
                      <InlineSpinner />
                      Signing in…
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={onMagicSubmit} className="mt-8 flex flex-col gap-5">
                <div>
                  <label
                    htmlFor="magic-email"
                    className="text-xs font-semibold uppercase tracking-wider text-muted"
                  >
                    Email
                  </label>
                  <input
                    id="magic-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <p className="text-[13px] leading-relaxed text-muted">
                  We&apos;ll email you a one-tap link. No password needed — works best when SMTP is
                  configured for your project (e.g. Resend).
                </p>
                {errorMsg ? (
                  <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {errorMsg}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={magicLoading}
                  className="touch-manipulation flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-[15px] font-semibold text-white shadow-glow transition duration-200 hover:brightness-110 disabled:pointer-events-none disabled:opacity-55"
                >
                  {magicLoading ? (
                    <>
                      <InlineSpinner />
                      Sending link…
                    </>
                  ) : (
                    "Email magic link"
                  )}
                </button>
              </form>
            )}
          </>
        )}

        {!awaitingMagicLink ? (
          <p className="mt-8 text-center text-[15px] text-muted">
            No account?{" "}
            <Link
              href={registerHref}
              className="font-semibold text-primary transition hover:text-primary/85"
            >
              Register
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}

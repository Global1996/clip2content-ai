"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckEmailPanel } from "@/components/auth/check-email-panel";
import { EmailConfirmationTroubleshoot } from "@/components/auth/email-confirmation-troubleshoot";
import { InlineSpinner } from "@/components/auth/inline-spinner";
import { useResendCooldown } from "@/hooks/use-resend-cooldown";
import { buildAuthCallbackUrl, resolveAuthRedirectOrigin } from "@/lib/auth/email-auth-url";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/client";
import { VirloWordmark } from "@/components/brand/virlo-logo";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = getSafeRedirectPath(searchParams.get("redirect"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [awaitingVerification, setAwaitingVerification] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const { secondsLeft, startCooldown, canResend } = useResendCooldown(30);

  const queryString = searchParams.toString();
  const loginHref = queryString ? `/login?${queryString}` : "/login";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const origin = resolveAuthRedirectOrigin();

    const supabase = createClient();
    const emailRedirectTo =
      origin && redirect ? buildAuthCallbackUrl(origin, redirect) : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: emailRedirectTo
        ? { emailRedirectTo }
        : undefined,
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    if (data.session) {
      router.push(redirect);
      router.refresh();
      return;
    }
    setAwaitingVerification(true);
    startCooldown();
  }

  async function resendConfirmationEmail() {
    const trimmed = email.trim();
    if (!trimmed || !canResend) return;

    setResendLoading(true);
    setErrorMsg(null);

    const origin = resolveAuthRedirectOrigin();

    const supabase = createClient();
    const emailRedirectTo =
      origin && redirect ? buildAuthCallbackUrl(origin, redirect) : undefined;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: trimmed,
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    });

    setResendLoading(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    startCooldown();
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-border-subtle bg-surface px-4 py-3.5 text-base text-foreground placeholder:text-muted/70 outline-none transition duration-200 focus:border-primary/45 focus:ring-2 focus:ring-primary/15 md:text-[15px]";

  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16 md:px-8">
      <VirloWordmark href="/" className="mb-12" />
      <div className="w-full max-w-[440px] rounded-2xl border border-border-subtle bg-surface/90 p-6 shadow-soft-lg backdrop-blur-md sm:p-10">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">
          Create account
        </h1>
        <p className="mt-3 text-center text-[15px] leading-relaxed text-muted">
          Start generating in under a minute.
        </p>

        {awaitingVerification ? (
          <div className="mt-10 flex flex-col gap-6">
            <CheckEmailPanel
              email={email.trim()}
              hint="We sent a confirmation link to"
              onResend={resendConfirmationEmail}
              resendLoading={resendLoading}
              canResend={canResend}
              secondsUntilResend={secondsLeft}
            />
            <EmailConfirmationTroubleshoot />
            {errorMsg ? (
              <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
                {errorMsg}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setAwaitingVerification(false);
                setErrorMsg(null);
              }}
              className="text-center text-[15px] font-semibold text-primary transition hover:text-primary/85"
            >
              Use a different email
            </button>
            <p className="text-center text-[15px] text-muted">
              Already confirmed?{" "}
              <Link
                href={loginHref}
                className="font-semibold text-primary transition hover:text-primary/85"
              >
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-5">
            <div>
              <label
                htmlFor="reg-email"
                className="text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Email
              </label>
              <input
                id="reg-email"
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
                htmlFor="reg-password"
                className="text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
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
              className="touch-manipulation mt-2 flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-semibold text-white shadow-glow transition duration-200 hover:brightness-110 disabled:pointer-events-none disabled:opacity-55"
            >
              {loading ? (
                <>
                  <InlineSpinner />
                  Sending…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        )}

        {!awaitingVerification ? (
          <p className="mt-8 text-center text-[15px] text-muted">
            Already have an account?{" "}
            <Link
              href={loginHref}
              className="font-semibold text-primary transition hover:text-primary/85"
            >
              Sign in
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { VirloWordmark } from "@/components/brand/virlo-logo";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = getSafeRedirectPath(searchParams.get("redirect"));
  const err = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    err === "auth" ? "Authentication failed." : null
  );

  const queryString = searchParams.toString();
  const registerHref = queryString ? `/register?${queryString}` : "/register";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-border-subtle bg-surface px-4 py-3.5 text-base text-foreground placeholder:text-muted/70 outline-none transition duration-200 focus:border-primary/45 focus:ring-2 focus:ring-primary/15 md:text-[15px]";

  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16 md:px-8">
      <VirloWordmark href="/" className="mb-12" />
      <div className="w-full max-w-[440px] rounded-2xl border border-border-subtle bg-surface/90 p-6 shadow-soft-lg backdrop-blur-md sm:p-10">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="mt-3 text-center text-[15px] leading-relaxed text-muted">
          Welcome back. Use your email and password.
        </p>
        <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted">
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
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted">
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
          {message && (
            <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="touch-manipulation mt-2 flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-4 text-[15px] font-semibold text-white shadow-glow transition duration-200 hover:brightness-110 disabled:opacity-55"
          >
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>
        <p className="mt-8 text-center text-[15px] text-muted">
          No account?{" "}
          <Link href={registerHref} className="font-semibold text-primary transition hover:text-primary/85">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

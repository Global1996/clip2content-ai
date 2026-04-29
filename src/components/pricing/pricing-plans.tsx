"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type PlanKey = "free" | "pro" | "lifetime";

const plans: {
  key: PlanKey;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "",
    desc: "Try Virlo on the free tier with daily limits.",
    features: ["2 free generations per day (UTC)", "Full structured output", "Saved history"],
  },
  {
    key: "pro",
    name: "Pro",
    price: "$9",
    period: "/month",
    desc: "Unlimited generations for serious creators.",
    features: ["Unlimited generations", "Stripe subscription", "Cancel anytime"],
    highlight: true,
  },
  {
    key: "lifetime",
    name: "Lifetime",
    price: "$29",
    period: " once",
    desc: "Pay once. Unlimited forever.",
    features: ["Unlimited generations", "One-time payment", "No recurring fees"],
  },
];

export function PricingPlans() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<PlanKey | null>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function startCheckout(plan: "pro" | "lifetime") {
    setCheckoutLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        code?: string;
      };
      if (res.status === 401) {
        window.location.href = "/login?redirect=/pricing";
        return;
      }
      if (!res.ok) {
        if (data.code === "BILLING_DISABLED") {
          throw new Error(
            "Billing nu e configurat încă: completează STRIPE_SECRET_KEY, STRIPE_PRICE_PRO_MONTHLY și STRIPE_PRICE_LIFETIME în .env.local."
          );
        }
        throw new Error(data.error ?? "Checkout failed");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-8 md:gap-y-8 lg:max-w-7xl lg:grid-cols-3 lg:gap-8">
      {plans.map((p, i) => (
        <div
          key={p.key}
          className={cn(
            i === 2 &&
              "md:col-span-2 md:flex md:justify-center lg:col-span-1 lg:block"
          )}
        >
          <div
            className={cn(
              "flex h-full flex-col",
              i === 2 && "w-full max-w-md lg:max-w-none"
            )}
          >
            <div
              className={
                p.highlight
                  ? "relative flex h-full flex-col rounded-2xl border border-primary/35 bg-gradient-to-b from-primary/[0.12] to-surface p-6 shadow-[0_24px_80px_-24px_rgba(91,140,255,0.35)] sm:p-8 lg:p-10"
                  : "card-premium flex h-full flex-col p-6 sm:p-8 lg:p-10"
              }
            >
          {p.highlight && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-background">
              Popular
            </span>
          )}
          <h2 className="text-xl font-semibold text-foreground">{p.name}</h2>
          <p className="mt-3 min-h-[52px] text-sm leading-relaxed text-muted lg:text-[15px]">
            {p.desc}
          </p>
          <div className="mt-10 flex items-baseline gap-1">
            <span className="text-5xl font-semibold tracking-tight text-foreground">
              {p.price}
            </span>
            <span className="text-sm text-muted">{p.period}</span>
          </div>
          <ul className="mt-10 flex flex-1 flex-col gap-4 text-[15px] text-muted">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(124,242,156,0.5)]" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {p.key === "free" && (
            <Link
              href="/register"
              className="touch-manipulation mt-12 inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-border-subtle bg-transparent px-4 text-sm font-medium text-foreground transition duration-200 hover:border-primary/35 hover:bg-surface-elevated"
            >
              Start free
            </Link>
          )}

          {p.key === "pro" && (
            <button
              type="button"
              disabled={checkoutLoading !== null || authed === null}
              onClick={() => {
                if (!authed) {
                  window.location.href = "/login?redirect=/pricing";
                  return;
                }
                startCheckout("pro");
              }}
              className="touch-manipulation mt-12 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-glow transition duration-200 hover:brightness-110 disabled:opacity-60"
            >
              {checkoutLoading === "pro"
                ? "Redirecting…"
                : authed
                  ? "Subscribe"
                  : "Sign in to subscribe"}
            </button>
          )}

          {p.key === "lifetime" && (
            <button
              type="button"
              disabled={checkoutLoading !== null || authed === null}
              onClick={() => {
                if (!authed) {
                  window.location.href = "/login?redirect=/pricing";
                  return;
                }
                startCheckout("lifetime");
              }}
              className="touch-manipulation mt-12 inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-border-subtle bg-transparent px-4 text-sm font-medium text-foreground transition duration-200 hover:border-primary/35 hover:bg-surface-elevated disabled:opacity-60"
            >
              {checkoutLoading === "lifetime"
                ? "Redirecting…"
                : authed
                  ? "Buy lifetime access"
                  : "Sign in to purchase"}
            </button>
          )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

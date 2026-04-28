import { MarketingShell } from "@/components/marketing-shell";
import { PricingPlans } from "@/components/pricing/pricing-plans";

export const metadata = {
  title: "Pricing",
  description: "Free, Pro, and Lifetime plans for Virlo.",
};

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="border-b border-border-subtle px-4 py-14 sm:px-6 sm:py-20 md:px-8 md:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl px-1 text-center lg:max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Pricing
          </p>
          <h1 className="mt-6 text-[clamp(2.25rem,5vw,3.75rem)] font-semibold tracking-tight text-foreground">
            Simple pricing
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
            Free tier includes 3 generations per UTC day. Upgrade for unlimited AI packs.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:py-24">
        <PricingPlans />
        <p className="mx-auto mt-14 max-w-2xl text-center text-xs leading-relaxed text-muted">
          Payments are processed securely by Stripe. Configure{" "}
          <code className="rounded bg-surface px-1 py-0.5 text-[11px] text-muted">
            STRIPE_PRICE_PRO_MONTHLY
          </code>{" "}
          and{" "}
          <code className="rounded bg-surface px-1 py-0.5 text-[11px] text-muted">
            STRIPE_PRICE_LIFETIME
          </code>{" "}
          in your environment after creating Products & Prices in the Stripe Dashboard.
          Webhook endpoint:{" "}
          <code className="rounded bg-surface px-1 py-0.5 text-[11px] text-muted">
            /api/webhooks/stripe
          </code>
          .
        </p>
      </section>
    </MarketingShell>
  );
}

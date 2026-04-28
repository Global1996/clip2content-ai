import { PricingPlans } from "@/components/pricing/pricing-plans";

export function LandingPricing() {
  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl lg:max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Pricing
          </p>
          <h2 className="mt-4 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-tight text-foreground">
            Start free. Scale when you&apos;re ready.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Try Virlo free — upgrade when you need unlimited generations.
          </p>
        </div>
        <PricingPlans />
      </div>
    </section>
  );
}

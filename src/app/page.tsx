import { MarketingShell } from "@/components/marketing-shell";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingDemo } from "@/components/landing/landing-demo";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingPricing } from "@/components/landing/landing-pricing";

export default function HomePage() {
  return (
    <MarketingShell>
      <LandingHero />
      <LandingFeatures />
      <LandingDemo />
      <LandingPricing />
      <LandingCta />
    </MarketingShell>
  );
}

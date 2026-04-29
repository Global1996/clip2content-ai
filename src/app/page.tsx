import { MarketingShell } from "@/components/marketing-shell";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingLiveDemo } from "@/components/landing/landing-live-demo";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingSocialProof } from "@/components/landing/landing-social-proof";
import { LandingTemplates } from "@/components/landing/landing-templates";

export default function HomePage() {
  return (
    <MarketingShell>
      <LandingHero />
      <LandingSocialProof />
      <LandingLiveDemo />
      <LandingTemplates />
      <LandingFeatures />
      <LandingPricing />
      <LandingCta />
    </MarketingShell>
  );
}

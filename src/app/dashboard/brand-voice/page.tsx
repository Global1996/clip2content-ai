import type { Metadata } from "next";
import { BrandVoiceClient } from "./brand-voice-client";

export const metadata: Metadata = {
  title: "Brand Voice",
  description: "Train Virlo on your voice — Pro feature.",
};

export default function DashboardBrandVoicePage() {
  return <BrandVoiceClient />;
}

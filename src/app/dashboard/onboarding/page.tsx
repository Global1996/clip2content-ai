import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { needsOnboarding } from "@/lib/dashboard/onboarding";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";

export const metadata = {
  title: "Welcome · Virlo",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/onboarding");
  }

  const meta = user.user_metadata as Record<string, unknown> | undefined;

  if (!(await needsOnboarding(supabase, user.id, meta))) {
    redirect("/dashboard");
  }

  return <OnboardingWizard />;
}

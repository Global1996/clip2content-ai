import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { needsOnboarding } from "@/lib/dashboard/onboarding";
import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";
import { DashboardPremiumSkeleton } from "@/components/dashboard/dashboard-skeleton";

async function DashboardHomeShell() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (await needsOnboarding(supabase, user.id, meta)) {
    redirect("/dashboard/onboarding");
  }

  const displayName =
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta?.name === "string" && meta.name.trim()) ||
    user.email?.split("@")[0] ||
    "Creator";

  return <DashboardHomeView displayName={displayName} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPremiumSkeleton />}>
      <DashboardHomeShell />
    </Suspense>
  );
}

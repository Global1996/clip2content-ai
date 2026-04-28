import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";
import { DashboardPremiumSkeleton } from "@/components/dashboard/dashboard-skeleton";

async function DashboardHomeShell() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const displayName =
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta?.name === "string" && meta.name.trim()) ||
    user?.email?.split("@")[0] ||
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

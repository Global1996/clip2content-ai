import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadUserDashboard } from "@/lib/dashboard/user-dashboard";
import { DashboardProvider } from "@/components/dashboard/dashboard-context";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const payload = await loadUserDashboard(supabase, user.id);

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const displayName =
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta?.name === "string" && meta.name.trim()) ||
    user.email?.split("@")[0] ||
    "Creator";

  return (
    <DashboardProvider initial={payload}>
      <DashboardShell user={{ displayName, email: user.email ?? null }}>
        {children}
      </DashboardShell>
    </DashboardProvider>
  );
}

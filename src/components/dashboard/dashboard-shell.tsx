"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopNav } from "@/components/dashboard/dashboard-top-nav";

const RightRail = dynamic(
  () =>
    import("@/components/dashboard/dashboard-right-rail").then((m) => m.DashboardRightRail),
  {
    ssr: false,
    loading: () => (
      <aside
        className="hidden h-fit w-[320px] shrink-0 flex-col gap-5 xl:flex"
        aria-hidden
      >
        <div className="dash-shimmer-block h-[140px] rounded-2xl bg-white/[0.05]" />
        <div className="dash-shimmer-block h-[200px] rounded-2xl bg-white/[0.05]" />
        <div className="dash-shimmer-block min-h-[180px] flex-1 rounded-2xl bg-white/[0.05]" />
      </aside>
    ),
  }
);

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { displayName: string; email: string | null };
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dash-app dark min-h-screen bg-[#0B0F19] text-zinc-100 antialiased">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(124,58,237,0.16),transparent_55%),radial-gradient(ellipse_50%_45%_at_100%_0%,rgba(37,99,235,0.1),transparent_50%),radial-gradient(ellipse_42%_38%_at_0%_92%,rgba(34,211,238,0.07),transparent_48%)]"
        aria-hidden
      />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="relative z-10 flex min-h-screen flex-col lg:pl-[292px]">
        <DashboardTopNav
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex min-h-0 flex-1 justify-center">
          <div className="flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:pb-8 lg:pt-8 xl:items-start">
            <div className="min-h-0 min-w-0 flex-1">{children}</div>
            <RightRail />
          </div>
        </div>
      </div>
    </div>
  );
}

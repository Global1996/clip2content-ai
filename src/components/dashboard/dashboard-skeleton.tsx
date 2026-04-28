import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function DashboardHeroSkeleton() {
  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Skeleton className="h-12 w-full max-w-[220px] rounded-2xl sm:w-[220px]" />
    </div>
  );
}

function DashboardWorkspaceSkeleton({ embedded }: { embedded?: boolean }) {
  return (
    <div
      className={cn(
        "space-y-6",
        !embedded && "mt-10 lg:mt-12"
      )}
    >
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-12 w-40 rounded-2xl" />
        <Skeleton className="h-12 w-32 rounded-2xl" />
      </div>
    </div>
  );
}

/** Full dashboard placeholder — hero, usage strip, topic area (no duplicate title when swapping with real UI). */
export function DashboardFullSkeleton() {
  return (
    <div className="space-y-10 lg:space-y-12">
      <DashboardHeroSkeleton />
      <UsageBannerSkeleton embedded />
      <DashboardWorkspaceSkeleton embedded />
    </div>
  );
}

/** Shimmer block matching `globals.css` `.dash-shimmer-block`. */
function DashShimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn("dash-shimmer-block rounded-2xl bg-white/[0.06]", className)}
    />
  );
}

/** Premium dashboard shell skeleton — matches home vertical rhythm (`gap-12` / `gap-14`). */
export function DashboardPremiumSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 pb-[max(5rem,env(safe-area-inset-bottom))] sm:gap-12 lg:gap-14 lg:pb-24 xl:gap-16">
      <div className="space-y-3">
        <DashShimmer className="h-11 w-[min(100%,22rem)]" />
        <DashShimmer className="h-4 w-full max-w-md rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        {[0, 1, 2, 3].map((i) => (
          <DashShimmer key={i} className="h-[118px]" />
        ))}
      </div>
      <div className="dash-section-rule shrink-0 opacity-80" aria-hidden />
      <div className="space-y-6">
        <div className="space-y-2">
          <DashShimmer className="h-3 w-20 rounded-full" />
          <DashShimmer className="h-6 w-48" />
          <DashShimmer className="h-4 w-full max-w-md rounded-lg bg-white/[0.04]" />
        </div>
        <DashShimmer className="min-h-[300px] w-full" />
      </div>
      <div className="dash-section-rule shrink-0 opacity-80" aria-hidden />
      <div className="space-y-6">
        <div className="space-y-2">
          <DashShimmer className="h-3 w-16 rounded-full" />
          <DashShimmer className="h-6 w-56" />
          <DashShimmer className="h-4 w-full max-w-sm rounded-lg bg-white/[0.04]" />
        </div>
        <DashShimmer className="h-36 w-full" />
      </div>
    </div>
  );
}

/** Alias for route `loading.tsx` and Suspense fallback (premium shell). */
export function DashboardPageSkeleton() {
  return <DashboardPremiumSkeleton />;
}

export function HistoryCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/[0.06] bg-[#111827]/50 p-6 shadow-xl shadow-black/20"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-28 rounded-full bg-white/[0.06]" />
              <Skeleton className="h-6 w-full max-w-xl bg-white/[0.06]" />
              <Skeleton className="h-6 w-full max-w-lg bg-white/[0.06]" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28 rounded-xl bg-white/[0.06]" />
              <Skeleton className="h-10 w-20 rounded-xl bg-white/[0.06]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function UsageBannerSkeleton({ embedded }: { embedded?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface px-5 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between",
        !embedded && "mt-8"
      )}
    >
      <Skeleton className="h-5 w-full max-w-md" />
      <Skeleton className="h-9 w-40 rounded-xl" />
    </div>
  );
}

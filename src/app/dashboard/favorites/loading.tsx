import { DashboardPremiumSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function FavoritesLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-24 pt-2 lg:pb-28">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-white/[0.06]" />
      <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-lg bg-white/[0.04]" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-white/[0.05]"
          />
        ))}
      </div>
      <DashboardPremiumSkeleton />
    </div>
  );
}

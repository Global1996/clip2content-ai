import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Lightweight pulse skeleton — avoids expensive blur/shimmer on low-end devices. */
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/[0.07]",
        className
      )}
      {...props}
    />
  );
}

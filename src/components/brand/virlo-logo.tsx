"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/** Gradient “V” mark — purple → blue (Virlo) */
export function VirloMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-[17px] font-bold tracking-tight text-white shadow-[0_8px_32px_-8px_rgba(124,58,237,0.65)] ring-1 ring-white/15",
        className
      )}
      aria-hidden
    >
      V
    </span>
  );
}

type VirloWordmarkProps = {
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
};

export function VirloWordmark({
  href = "/",
  onClick,
  className,
  size = "md",
}: VirloWordmarkProps) {
  const text =
    size === "sm" ? "text-base font-semibold" : "text-lg font-semibold tracking-tight";
  const inner = (
    <span className="flex items-center gap-2.5">
      <VirloMark className={size === "sm" ? "h-8 w-8 text-[15px]" : undefined} />
      <span
        className={cn(
          "bg-gradient-to-r from-[#A78BFA] via-[#818CF8] to-[#38BDF8] bg-clip-text text-transparent",
          text
        )}
      >
        Virlo
      </span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "transition-[opacity,transform] duration-200 ease-out hover:opacity-90 active:scale-[0.99]",
          className
        )}
      >
        {inner}
      </Link>
    );
  }

  return <span className={className}>{inner}</span>;
}

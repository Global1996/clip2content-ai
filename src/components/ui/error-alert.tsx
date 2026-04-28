"use client";

import { cn } from "@/lib/utils";

type ErrorAlertProps = {
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "danger" | "warning";
};

export function ErrorAlert({
  title,
  children,
  onDismiss,
  actionLabel,
  onAction,
  variant = "danger",
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "mt-8 flex flex-col gap-3 rounded-2xl border px-5 py-4 sm:flex-row sm:items-start sm:justify-between",
        variant === "danger" &&
          "border-red-500/25 bg-red-500/10 text-red-200",
        variant === "warning" &&
          "border-amber-500/25 bg-amber-500/10 text-amber-100"
      )}
    >
      <div className="min-w-0 flex-1 text-[15px] leading-relaxed">
        {title && <p className="font-semibold text-foreground">{title}</p>}
        <div className={cn(title && "mt-1")}>{children}</div>
      </div>
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
        {onAction && actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="touch-manipulation inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/15 sm:w-auto sm:min-h-0 sm:py-2"
          >
            {actionLabel}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="touch-manipulation inline-flex min-h-[44px] w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition hover:text-foreground sm:w-auto sm:min-h-0 sm:py-2"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

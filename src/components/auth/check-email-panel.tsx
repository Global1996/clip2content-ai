"use client";

import { InlineSpinner } from "@/components/auth/inline-spinner";

type CheckEmailPanelProps = {
  email: string;
  /** Short line under the headline (e.g. confirm signup vs magic link). */
  hint: string;
  onResend: () => void | Promise<void>;
  resendLoading: boolean;
  /** False during initial cooldown after send */
  canResend: boolean;
  secondsUntilResend: number;
};

export function CheckEmailPanel({
  email,
  hint,
  onResend,
  resendLoading,
  canResend,
  secondsUntilResend,
}: CheckEmailPanelProps) {
  const resendLabel = !canResend
    ? `Resend in ${secondsUntilResend}s`
    : resendLoading
      ? "Sending…"
      : "Resend email";

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/12 to-primary/5 px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <p className="text-center text-lg font-semibold tracking-tight text-foreground">
        Check your email
      </p>
      <p className="mt-3 text-center text-[15px] leading-relaxed text-muted">
        {hint}{" "}
        <span className="font-medium text-foreground/95">{email}</span>.
      </p>
      <button
        type="button"
        onClick={() => void onResend()}
        disabled={!canResend || resendLoading}
        className="touch-manipulation mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-surface/90 text-[15px] font-semibold text-foreground transition hover:bg-surface disabled:pointer-events-none disabled:opacity-45"
      >
        {resendLoading ? (
          <>
            <InlineSpinner />
            Sending…
          </>
        ) : (
          resendLabel
        )}
      </button>
      {!canResend && !resendLoading ? (
        <p className="mt-3 text-center text-xs text-muted">
          Didn&apos;t get it? You can resend shortly — check spam too.
        </p>
      ) : null}
    </div>
  );
}

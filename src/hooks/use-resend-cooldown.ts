"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * After sending an email, blocks resend until {@link cooldownSeconds} elapses,
 * then decrements every second so UI can show "Resend in N s".
 */
export function useResendCooldown(cooldownSeconds = 30) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  const startCooldown = useCallback(() => {
    setSecondsLeft(cooldownSeconds);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const id = window.setTimeout(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  const canResend = secondsLeft === 0;

  return { secondsLeft, startCooldown, canResend };
}

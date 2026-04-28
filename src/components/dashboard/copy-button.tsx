"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type CopyButtonProps = {
  label?: string;
  copiedLabel?: string;
  text: string;
  className?: string;
};

export function CopyButton({
  label = "Copy",
  copiedLabel = "Copied",
  text,
  className,
}: CopyButtonProps) {
  const [done, setDone] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }

  const defaultClasses =
    "touch-manipulation inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border-subtle bg-background/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted shadow-soft transition-[border-color,background-color,color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-primary/35 hover:text-foreground active:scale-[0.97] sm:min-h-0 sm:min-w-0 sm:px-2.5 sm:py-1.5";

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      aria-label={done ? copiedLabel : `${label} to clipboard`}
      title={done ? copiedLabel : label}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      className={className ?? defaultClasses}
    >
      <span className="relative flex items-center gap-1.5">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.span
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              className="inline-flex items-center gap-1 text-accent"
            >
              <CheckIcon />
              <span>{copiedLabel}</span>
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5"
            >
              <ClipboardIcon />
              <span>{label}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

function ClipboardIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 opacity-80"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.25}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

"use client";

import { motion } from "framer-motion";
import type { ContentOutput } from "@/types/content";
import { serializeGenerationPlainText } from "@/lib/content/serialize-generation";
import { generationDownloadBasename } from "@/lib/content/generation-filename";
import { downloadTextFile } from "@/lib/download";
import { cn } from "@/lib/utils";

type DownloadPackButtonProps = {
  topic: string;
  output: ContentOutput;
  className?: string;
};

export function DownloadPackButton({
  topic,
  output,
  className,
}: DownloadPackButtonProps) {
  function handleDownload() {
    const text = serializeGenerationPlainText(topic, output);
    const name = `${generationDownloadBasename(topic)}.txt`;
    downloadTextFile(name, text);
  }

  return (
    <motion.button
      type="button"
      onClick={handleDownload}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      aria-label="Download full pack as .txt file"
      title="Download .txt"
      className={cn(
        "touch-manipulation inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground shadow-soft transition-[border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-surface-elevated hover:shadow-soft sm:py-2",
        className
      )}
    >
      <DownloadIcon />
      Download
    </motion.button>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 opacity-90"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

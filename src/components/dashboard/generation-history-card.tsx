"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ContentOutput } from "@/types/content";
import { serializeGenerationPlainText } from "@/lib/content/serialize-generation";
import { CopyButton } from "@/components/dashboard/copy-button";
import { DownloadPackButton } from "@/components/dashboard/download-pack-button";
import { GenerationOutputView } from "@/components/dashboard/generation-output-view";

export type HistoryCardRow = {
  id: string;
  topic: string;
  output: ContentOutput;
  created_at: string;
};

type GenerationHistoryCardProps = {
  row: HistoryCardRow;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
};

export function GenerationHistoryCard({
  row,
  expanded,
  onToggle,
  onDelete,
}: GenerationHistoryCardProps) {
  const fullPack = serializeGenerationPlainText(row.topic, row.output);
  const created = new Date(row.created_at);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-soft transition duration-300 hover:border-primary/15 hover:shadow-soft-lg">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-6">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <time
              dateTime={row.created_at}
              className="rounded-full border border-border-subtle bg-background/50 px-3 py-1 text-[11px] font-medium tabular-nums text-muted"
            >
              {created.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {" · "}
              {created.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </time>
          </div>
          <h3 className="line-clamp-3 text-[17px] font-semibold leading-snug tracking-tight text-foreground">
            {row.topic}
          </h3>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <CopyButton
              label="Copy full pack"
              copiedLabel="Copied pack"
              text={fullPack}
              className="touch-manipulation w-full rounded-xl border border-primary/35 bg-primary/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-primary transition-[border-color,background-color] duration-300 hover:bg-primary/18 sm:w-auto sm:py-2"
            />
            <DownloadPackButton
              topic={row.topic}
              output={row.output}
              className="w-full sm:w-auto"
            />
            <button
              type="button"
              onClick={onToggle}
              className="touch-manipulation rounded-xl border border-border-subtle px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted transition hover:bg-background/80 hover:text-foreground sm:py-2"
            >
              {expanded ? "Hide" : "View"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="touch-manipulation rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted transition hover:bg-red-500/10 hover:text-red-400 sm:py-2"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border-subtle bg-background/30"
          >
            <div className="px-4 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
              <GenerationOutputView output={row.output} embedded />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ContentOutput } from "@/types/content";
import type { FavoriteRow } from "@/types/favorites";
import { serializeGenerationPlainText } from "@/lib/content/serialize-generation";
import { CopyButton } from "@/components/dashboard/copy-button";
import { GenerationOutputView } from "@/components/dashboard/generation-output-view";
import { favoriteRegenerateHref } from "@/lib/dashboard/favorite-links";

const TYPE_LABEL: Record<string, string> = {
  hook: "Hook",
  caption: "Caption",
  script: "Script",
  idea: "Idea",
  full_pack: "Full pack",
};

type Props = {
  favorite: FavoriteRow | null;
  open: boolean;
  onClose: () => void;
};

export function FavoriteDetailModal({ favorite, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const output = favorite?.output as ContentOutput | undefined;

  return (
    <AnimatePresence>
      {open && favorite && output ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="fav-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 backdrop-blur-md sm:items-center sm:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-[min(92vh,880px)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0f141f] shadow-[0_40px_120px_-48px_rgba(0,0,0,0.85)]"
          >
            <div className="flex shrink-0 flex-col gap-3 border-b border-white/[0.06] px-6 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-8">
              <div className="min-w-0">
                <p
                  id="fav-modal-title"
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500"
                >
                  {TYPE_LABEL[favorite.content_type] ?? "Saved pack"}
                </p>
                <h2 className="mt-1 text-xl font-semibold leading-snug tracking-tight text-white">
                  {favorite.title}
                </h2>
                {favorite.topic_snapshot ? (
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-400">
                    {favorite.topic_snapshot}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <CopyButton
                  label="Copy full pack"
                  copiedLabel="Copied pack"
                  text={serializeGenerationPlainText(
                    favorite.topic_snapshot ?? favorite.title,
                    output
                  )}
                  className="border-violet-500/35 bg-violet-500/15 text-violet-200 hover:bg-violet-500/25"
                />
                <Link
                  href={favoriteRegenerateHref(favorite)}
                  className="touch-manipulation inline-flex items-center rounded-xl border border-cyan-500/35 bg-cyan-500/12 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                >
                  Regenerate
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="touch-manipulation rounded-xl border border-white/[0.1] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06]"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-6 sm:px-8">
              <GenerationOutputView output={output} embedded emphasis="full" />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

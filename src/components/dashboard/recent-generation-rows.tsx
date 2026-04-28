"use client";

import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ContentOutput } from "@/types/content";
import { validateContentOutput } from "@/types/content";
import { countContentPieces } from "@/lib/dashboard/content-metrics";
import { serializeGenerationPlainText } from "@/lib/content/serialize-generation";
import { CopyButton } from "@/components/dashboard/copy-button";
import { GenerationOutputView } from "@/components/dashboard/generation-output-view";
import { useDashboardData } from "@/components/dashboard/dashboard-context";

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  x: "X",
};

function inferPrimaryPlatform(topic: string): string | null {
  const m = /primary platform:\s*(\w+)/i.exec(topic);
  if (!m) return null;
  const id = m[1].toLowerCase();
  return PLATFORM_LABELS[id] ? id : null;
}

function PlatformChip({ topic }: { topic: string }) {
  const id = inferPrimaryPlatform(topic);
  const label = id ? PLATFORM_LABELS[id] ?? id : "Multi-platform";

  const Glyph =
    id === "youtube"
      ? YouTubeGlyph
      : id === "linkedin"
        ? LinkedInGlyph
        : id === "instagram"
          ? InstagramGlyph
          : id === "x"
            ? XGlyph
            : id === "tiktok"
              ? TikTokGlyph
              : GlobeGlyph;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-300">
      <span className="text-zinc-400">
        <Glyph />
      </span>
      {label}
    </span>
  );
}

type RowProps = {
  row: {
    id: string;
    topic: string;
    output: ContentOutput;
    created_at: string;
  };
  expanded: boolean;
  onToggle: () => void;
  index: number;
  onDeleted: (id: string) => void;
};

function RecentRowInner({
  row,
  expanded,
  onToggle,
  index,
  onDeleted,
}: RowProps) {
  const prefersReducedMotion = useReducedMotion();
  const created = new Date(row.created_at);
  const fullPack = serializeGenerationPlainText(row.topic, row.output);
  const pieces = countContentPieces(row.output);
  const [busy, setBusy] = useState(false);

  const topicDisplay = useMemo(() => {
    const lines = row.topic.split("\n").filter(Boolean);
    const raw =
      lines.find((l) => l.startsWith("Topic:"))?.replace(/^Topic:\s*/i, "").trim() ??
      row.topic;
    return raw.slice(0, 280);
  }, [row.topic]);

  async function handleDelete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/generations?id=${encodeURIComponent(row.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      await onDeleted(row.id);
    } catch {
      /* errors surfaced on History */
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -2,
              transition: { type: "spring", stiffness: 400, damping: 30 },
            }
      }
      className="group/row overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111827]/70 shadow-xl shadow-black/25 backdrop-blur-md transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-violet-500/15 hover:shadow-[0_24px_48px_-32px_rgba(124,58,237,0.18)]"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <PlatformChip topic={row.topic} />
            <time
              dateTime={row.created_at}
              className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium tabular-nums text-zinc-400"
            >
              {created.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold tabular-nums text-emerald-300/95">
              {pieces} outputs
            </span>
          </div>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-white">
            {topicDisplay}
          </h3>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <motion.button
            type="button"
            onClick={onToggle}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.96 }}
            className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-300 transition-[border-color,background-color] duration-200 hover:border-white/[0.14] hover:bg-white/[0.06]"
          >
            {expanded ? "Collapse" : "View"}
          </motion.button>
          <CopyButton
            label="Copy"
            copiedLabel="Copied"
            text={fullPack}
            className="rounded-xl border border-violet-500/35 bg-violet-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-violet-200 hover:bg-violet-500/20"
          />
          <button
            type="button"
            disabled
            title="Favorite — Pro feature (soon)"
            className="cursor-not-allowed rounded-xl border border-white/[0.06] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 opacity-70"
          >
            Favorite
          </button>
          <motion.button
            type="button"
            disabled={busy}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.94 }}
            onClick={handleDelete}
            className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {busy ? "…" : "Delete"}
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/[0.06] bg-[#0B0F19]/40"
          >
            <div className="px-5 pb-8 pt-6 sm:px-8">
              <GenerationOutputView output={row.output} embedded />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

const RecentRowCard = memo(RecentRowInner);

export function RecentGenerationRows({ limit = 5 }: { limit?: number }) {
  const { items, refresh } = useDashboardData();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const out: Array<{
      id: string;
      topic: string;
      output: ContentOutput;
      created_at: string;
    }> = [];
    for (const it of items) {
      if (!validateContentOutput(it.output)) continue;
      out.push({
        id: it.id,
        topic: it.topic,
        output: it.output as ContentOutput,
        created_at: it.created_at,
      });
      if (out.length >= limit) break;
    }
    return out;
  }, [items, limit]);

  const onDeleted = useCallback(
    async (id: string) => {
      await refresh({ silent: true });
      setExpandedId((e) => (e === id ? null : e));
    },
    [refresh]
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#111827]/40 px-6 py-14 text-center transition-[border-color,background-color] duration-300 hover:border-white/[0.11] hover:bg-[#111827]/55">
        <p className="text-sm leading-relaxed text-zinc-500">
          No generations yet. Create your first pack above — runs save automatically with timestamps.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <RecentRowCard
          key={row.id}
          row={row}
          index={index}
          expanded={expandedId === row.id}
          onToggle={() =>
            setExpandedId((id) => (id === row.id ? null : row.id))
          }
          onDeleted={onDeleted}
        />
      ))}
      <div className="flex justify-end pt-2">
        <Link
          href="/dashboard/history"
          className="group inline-flex items-center gap-1 text-sm font-medium text-violet-400 transition-colors duration-200 hover:text-violet-300"
        >
          <span className="border-b border-transparent pb-px transition-[border-color] duration-200 group-hover:border-violet-400/80">
            View all history
          </span>
          <span
            aria-hidden
            className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </div>
  );
}

function TikTokGlyph() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64v-3.5a6.38 6.38 0 00-1.76-.24 6.39 6.39 0 00-6.36 6.39 6.39 6.39 0 006.39 6.39 6.39 6.39 0 006.39-6.39V9.42a8.14 8.14 0 004.76 1.54v-3.7a4.82 4.82 0 01-3.71-2.57z" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.938 10.668 19.876 3h-1.406l-5.164 6.015L9.156 3H4l6.227 9.065L4 21h1.406l5.457-6.348L14.844 21H20l-6.062-10.332zM7.781 4.563 16.656 19.44h-1.594L6.218 4.562h1.563z" />
    </svg>
  );
}

function YouTubeGlyph() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinkedInGlyph() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GlobeGlyph() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm-8.22-5h16.44M12 21c2.5-2.34 4-5.57 4-9s-1.5-6.66-4-9c-2.5 2.34-4 5.57-4 9s1.5 6.66 4 9zM2.25 12h19.5" />
    </svg>
  );
}

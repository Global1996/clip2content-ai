"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import type { ContentOutput } from "@/types/content";
import { validateContentOutput } from "@/types/content";
import {
  GenerationHistoryCard,
  type HistoryCardRow,
} from "@/components/dashboard/generation-history-card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { useDashboardData } from "@/components/dashboard/dashboard-context";

export function DashboardHistoryView() {
  const { items, refresh } = useDashboardData();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows: HistoryCardRow[] = [];
  for (const it of items) {
    if (!validateContentOutput(it.output)) continue;
    rows.push({
      id: it.id,
      topic: it.topic,
      output: it.output as ContentOutput,
      created_at: it.created_at,
    });
  }

  async function onDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/generations?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setExpandedId((e) => (e === id ? null : e));
      await refresh({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 pb-20 lg:gap-12 lg:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          History
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-zinc-400">
          Every generation you&apos;ve saved — expand to review or export packs.
        </p>
      </motion.div>

      {error && (
        <ErrorAlert
          title="Couldn’t delete"
          onDismiss={() => setError(null)}
          variant="danger"
        >
          {error}
        </ErrorAlert>
      )}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/[0.08] bg-[#111827]/40 px-8 py-20 text-center text-[15px] leading-relaxed text-zinc-500 transition-[border-color] duration-300 hover:border-white/[0.12]">
          No generations yet. Head to{" "}
          <Link
            href="/dashboard/generate"
            className="font-semibold text-violet-400 underline-offset-4 hover:underline"
          >
            Generate
          </Link>{" "}
          to create your first pack.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {rows.map((row) => (
            <GenerationHistoryCard
              key={row.id}
              row={row}
              expanded={expandedId === row.id}
              onToggle={() =>
                setExpandedId((id) => (id === row.id ? null : row.id))
              }
              onDelete={() => onDelete(row.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

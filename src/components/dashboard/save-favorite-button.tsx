"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContentOutput } from "@/types/content";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/components/dashboard/dashboard-context";

type Props = {
  title: string;
  topicSnapshot: string;
  output: ContentOutput;
  platform?: string;
  sourceGenerationId?: string | null;
  tags?: string[];
  variant?: "dash" | "marketing";
  className?: string;
};

export function SaveFavoriteButton({
  title,
  topicSnapshot,
  output,
  platform = "tiktok",
  sourceGenerationId,
  tags = [],
  variant = "dash",
  className,
}: Props) {
  const { refresh } = useDashboardData();
  const linked = Boolean(sourceGenerationId);

  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(linked);

  // Re-resolve the linked favorite whenever the prop id changes (external state).
  useEffect(() => {
    if (!sourceGenerationId?.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFavoriteId(null);
      setResolving(false);
      return;
    }
    let cancelled = false;
    setResolving(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/favorites/by-generation/${encodeURIComponent(sourceGenerationId)}`,
          { credentials: "include", cache: "no-store" }
        );
        const data = (await res.json()) as { favoriteId?: string | null };
        if (!cancelled && res.ok) {
          setFavoriteId(
            data.favoriteId != null ? String(data.favoriteId) : null
          );
        }
      } catch {
        if (!cancelled) setFavoriteId(null);
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceGenerationId]);

  const postFavorite = useCallback(async (): Promise<string | null> => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: title.slice(0, 500),
        topic_snapshot: topicSnapshot.slice(0, 12000),
        output,
        content_type: "full_pack",
        platform,
        tags,
        source_generation_id: sourceGenerationId ?? undefined,
      }),
    });
    const data = (await res.json()) as {
      error?: string;
      code?: string;
      id?: string;
    };

    if (res.status === 409) {
      if (sourceGenerationId) {
        const check = await fetch(
          `/api/favorites/by-generation/${encodeURIComponent(sourceGenerationId)}`,
          { credentials: "include", cache: "no-store" }
        );
        const d = (await check.json()) as { favoriteId?: string | null };
        if (check.ok && d.favoriteId) return String(d.favoriteId);
      }
      return null;
    }
    if (!res.ok) throw new Error(data.error ?? "Save failed");
    return data.id != null ? String(data.id) : null;
  }, [
    title,
    topicSnapshot,
    output,
    platform,
    tags,
    sourceGenerationId,
  ]);

  async function act() {
    setLoading(true);
    setHint(null);
    try {
      if (linked) {
        if (favoriteId) {
          const res = await fetch(
            `/api/favorites/${encodeURIComponent(favoriteId)}`,
            { method: "DELETE", credentials: "include" }
          );
          if (!res.ok) throw new Error("Couldn't remove favorite");
          setFavoriteId(null);
          setHint("Removed");
        } else {
          const id = await postFavorite();
          if (id) setFavoriteId(id);
          setHint(id ? "Saved to favorites" : "Already in favorites");
        }
      } else {
        await postFavorite();
        setHint("Saved");
      }
      await refresh({ silent: true });
    } catch (e) {
      setHint(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
      setTimeout(() => setHint(null), 2600);
    }
  }

  const dashBase =
    "touch-manipulation inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition disabled:opacity-45";

  const dashOutline =
    "border-rose-500/35 bg-rose-500/10 text-rose-200 hover:bg-rose-500/18";

  const dashFilled =
    "border-emerald-500/40 bg-emerald-500/12 text-emerald-200 hover:bg-emerald-500/18";

  const mOutline =
    "border-primary/35 bg-primary/10 text-primary hover:bg-primary/18";

  const mFilled =
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/18";

  const busy = loading || (linked && resolving);

  let label: string;
  if (!linked) {
    label = loading ? "Saving…" : "Save to favorites";
  } else if (resolving && favoriteId === null) {
    label = "…";
  } else if (favoriteId) {
    label = loading ? "…" : "Saved · tap to remove";
  } else {
    label = loading ? "Saving…" : "Save to favorites";
  }

  const palette =
    variant === "dash"
      ? favoriteId
        ? dashFilled
        : dashOutline
      : favoriteId
        ? mFilled
        : mOutline;

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void act()}
        disabled={busy}
        title={
          linked
            ? favoriteId
              ? "Remove from favorites"
              : "Add to favorites"
            : "Save this pack to your library"
        }
        className={cn(dashBase, palette, className)}
      >
        <span aria-hidden className="text-[14px] leading-none">
          {linked ? (favoriteId ? "♥" : "♡") : "♡"}
        </span>
        {label}
      </button>
      {hint ? (
        <span className="text-[11px] font-medium text-zinc-400">{hint}</span>
      ) : null}
    </div>
  );
}

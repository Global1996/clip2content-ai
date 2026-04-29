"use client";

import Link from "next/link";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { ContentOutput } from "@/types/content";
import { validateContentOutput } from "@/types/content";
import type {
  FavoriteRow,
  FavoriteSort,
  FavoritesStatsPayload,
} from "@/types/favorites";
import { serializeGenerationPlainText } from "@/lib/content/serialize-generation";
import { CopyButton } from "@/components/dashboard/copy-button";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useDashboardData } from "@/components/dashboard/dashboard-context";
import { FavoriteDetailModal } from "@/components/dashboard/favorites/favorite-detail-modal";
import { FavoritePlatformIcon } from "@/components/dashboard/favorites/platform-icon";
import { favoriteRegenerateHref } from "@/lib/dashboard/favorite-links";

const TYPE_LABEL: Record<string, string> = {
  hook: "Hook",
  caption: "Caption",
  script: "Script",
  idea: "Idea",
  full_pack: "Full pack",
};

function previewLine(topic: string, output: ContentOutput): string {
  const hook = output.hooks[0];
  if (hook && hook.length > 0) return hook.slice(0, 140);
  return topic.slice(0, 140);
}

function parseFavorite(raw: Record<string, unknown>): FavoriteRow | null {
  if (!validateContentOutput(raw.output)) return null;
  return {
    id: String(raw.id),
    user_id: String(raw.user_id),
    title: String(raw.title ?? ""),
    topic_snapshot:
      raw.topic_snapshot === null || raw.topic_snapshot === undefined
        ? null
        : String(raw.topic_snapshot),
    output: raw.output as ContentOutput,
    content_type: raw.content_type as FavoriteRow["content_type"],
    platform: String(raw.platform ?? "tiktok"),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    usage_count: Number(raw.usage_count ?? 0),
    source_generation_id:
      raw.source_generation_id === null || raw.source_generation_id === undefined
        ? null
        : String(raw.source_generation_id),
    created_at: String(raw.created_at),
    updated_at: String(raw.updated_at ?? raw.created_at),
  };
}

export const DashboardFavoritesView = memo(function DashboardFavoritesView() {
  const { refresh } = useDashboardData();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<FavoriteRow[]>([]);
  const [stats, setStats] = useState<FavoritesStatsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 320);
  const [sort, setSort] = useState<FavoriteSort>("newest");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<FavoriteRow | null>(null);

  const [recentlyUsed, setRecentlyUsed] = useState<FavoriteRow[]>([]);
  const [mostUsedHighlights, setMostUsedHighlights] = useState<FavoriteRow[]>(
    []
  );

  const load = useCallback(async () => {
    setError(null);
    const qs = new URLSearchParams();
    if (debouncedSearch.trim()) qs.set("search", debouncedSearch.trim());
    qs.set("sort", sort);
    if (typeFilter !== "all") qs.set("type", typeFilter);
    if (platformFilter !== "all") qs.set("platform", platformFilter);
    if (selectedTags.length > 0) qs.set("tags", selectedTags.join(","));

    const res = await fetch(`/api/favorites?${qs.toString()}`, {
      credentials: "include",
      cache: "no-store",
    });
    const data = (await res.json()) as {
      favorites?: Record<string, unknown>[];
      stats?: FavoritesStatsPayload;
      recently_used?: Record<string, unknown>[];
      most_used?: Record<string, unknown>[];
      error?: string;
    };
    if (!res.ok) throw new Error(data.error ?? "Failed to load");

    const parsed: FavoriteRow[] = [];
    for (const r of data.favorites ?? []) {
      const row = parseFavorite(r);
      if (row) parsed.push(row);
    }
    setList(parsed);
    if (data.stats) setStats(data.stats);

    const ru: FavoriteRow[] = [];
    for (const r of data.recently_used ?? []) {
      const row = parseFavorite(r);
      if (row) ru.push(row);
    }
    setRecentlyUsed(ru);

    const mu: FavoriteRow[] = [];
    for (const r of data.most_used ?? []) {
      const row = parseFavorite(r);
      if (row) mu.push(row);
    }
    setMostUsedHighlights(mu);
  }, [debouncedSearch, sort, typeFilter, platformFilter, selectedTags]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleIncrementUsage = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/favorites/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ increment_usage: true }),
        });
        await load();
        await refresh({ silent: true });
      } catch {
        /* noop */
      }
    },
    [load, refresh]
  );

  async function removeFavorite(id: string) {
    try {
      const res = await fetch(`/api/favorites/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove");
      setModalOpen(false);
      setSelected(null);
      await load();
      await refresh({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Remove failed");
    }
  }

  function clearFilters() {
    setSearch("");
    setSort("newest");
    setTypeFilter("all");
    setPlatformFilter("all");
    setSelectedTags([]);
    setTagSearch("");
  }

  const s = stats ?? {
    total: 0,
    thisMonth: 0,
    byType: {},
    byPlatform: {},
    availableTags: [] as string[],
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-10 pb-24 lg:flex-row lg:items-start lg:gap-10 lg:pb-28">
      <div className="min-w-0 flex-1 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
            Favorites
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-zinc-400">
            Save and organize your best content. Access it anytime.
          </p>
        </motion.div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[200px] flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              🔍
            </span>
            <input
              type="search"
              placeholder="Search favorites…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-[#111827]/90 py-3.5 pl-11 pr-4 text-[15px] text-zinc-100 outline-none ring-offset-0 transition focus:border-violet-500/45 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as FavoriteSort)}
            className="cursor-pointer rounded-2xl border border-white/[0.08] bg-[#111827]/90 px-4 py-3.5 text-sm font-medium text-zinc-200 outline-none transition hover:border-white/[0.14]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most_used">Most used</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total favorites"
            value={s.total}
            gradient="from-violet-600/25 via-violet-500/10 to-transparent"
            icon="⭐"
            delay={0}
          />
          <StatCard
            label="This month"
            value={s.thisMonth}
            gradient="from-cyan-500/20 via-blue-600/10 to-transparent"
            icon="📅"
            delay={0.05}
          />
          <StatCard
            label="Content types"
            value={
              Object.keys(s.byType).filter((k) => (s.byType[k] ?? 0) > 0).length ||
              "—"
            }
            sub={`Hooks · Captions · Scripts`}
            gradient="from-fuchsia-500/20 via-violet-600/10 to-transparent"
            icon="🧩"
            delay={0.1}
          />
          <StatCard
            label="Platforms"
            value={
              Object.keys(s.byPlatform).filter((k) => (s.byPlatform[k] ?? 0) > 0)
                .length || "—"
            }
            sub="TikTok · IG · YouTube…"
            gradient="from-amber-500/20 via-rose-500/10 to-transparent"
            icon="🎯"
            delay={0.15}
          />
        </div>

        {!loading && s.total > 0 ? <RetentionInsightBanner /> : null}

        {loading ? (
          <RetentionRailsSkeleton />
        ) : s.total > 0 ? (
          <RetentionHighlightRails
            recentlyUsed={recentlyUsed}
            mostUsed={mostUsedHighlights}
            totalSaved={s.total}
            onViewFavorite={(f) => {
              setSelected(f);
              setModalOpen(true);
              void handleIncrementUsage(f.id);
            }}
          />
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        {loading ? (
          <FavoritesListSkeleton />
        ) : list.length === 0 ? (
          <EmptyFavorites />
        ) : (
          <ul className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {list.map((f, i) => (
                <motion.li
                  key={f.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: 0.28,
                    delay: Math.min(i * 0.03, 0.24),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#141a26]/95 to-[#0d111c]/95 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.85)] transition duration-300 hover:border-violet-500/25 hover:shadow-[0_28px_80px_-44px_rgba(124,58,237,0.22)]"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(124,58,237,0.06),transparent_42%)] opacity-0 transition duration-300 group-hover:opacity-100" />
                  <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <FavoritePlatformIcon platform={f.platform} />
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                          {TYPE_LABEL[f.content_type] ?? f.content_type}
                        </span>
                        <time
                          dateTime={f.created_at}
                          className="text-[11px] tabular-nums text-zinc-500"
                        >
                          {new Date(f.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                        {f.usage_count > 0 ? (
                          <span className="text-[11px] text-zinc-500">
                            · {f.usage_count} opens
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-white">
                        {f.title}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">
                        {previewLine(f.topic_snapshot ?? f.title, f.output)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(f.tags.length ? f.tags : ["Saved pack"]).map((t) => (
                          <span
                            key={`${f.id}-${t}`}
                            className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-0.5 text-[11px] font-medium text-zinc-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                      <div className="flex flex-wrap items-center gap-2">
                        <CopyButton
                          label="Copy"
                          copiedLabel="Copied"
                          text={serializeGenerationPlainText(
                            f.topic_snapshot ?? f.title,
                            f.output
                          )}
                          className="border-violet-500/35 bg-violet-500/15 text-violet-200 hover:bg-violet-500/25"
                        />
                        <QuickRegenerateLink favorite={f} />
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(f);
                            setModalOpen(true);
                            void handleIncrementUsage(f.id);
                          }}
                          className="touch-manipulation rounded-xl border border-white/[0.1] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-200 transition hover:bg-white/[0.06]"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeFavorite(f.id)}
                          className="touch-manipulation rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                        >
                          Remove
                        </button>
                        <FavoriteRowMore favorite={f} />
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[340px] xl:w-[360px]">
        <FilterCard
          typeFilter={typeFilter}
          platformFilter={platformFilter}
          tagSearch={tagSearch}
          selectedTags={selectedTags}
          availableTags={s.availableTags}
          onType={setTypeFilter}
          onPlatform={setPlatformFilter}
          onTagSearch={setTagSearch}
          onToggleTag={(tag) => {
            setSelectedTags((prev) =>
              prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
            );
          }}
          onClear={clearFilters}
        />
        <QuickActionsCard />
        <TemplatesCard />
      </aside>

      <FavoriteDetailModal
        favorite={selected}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
      />
    </div>
  );
});

function StatCard({
  label,
  value,
  sub,
  gradient,
  icon,
  delay,
}: {
  label: string;
  value: number | string;
  sub?: string;
  gradient: string;
  icon: string;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        reduceMotion
          ? undefined
          : { scale: 1.012, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }
      }
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827]/80 p-5 shadow-xl backdrop-blur-md",
        `bg-gradient-to-br ${gradient}`
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-white">
            {value}
          </p>
          {sub ? (
            <p className="mt-1 text-[11px] leading-snug text-zinc-500">{sub}</p>
          ) : null}
        </div>
        <span className="text-2xl opacity-90" aria-hidden>
          {icon}
        </span>
      </div>
    </motion.div>
  );
}

function RetentionInsightBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-violet-500/25 bg-gradient-to-r from-violet-950/50 via-[#141a26]/95 to-cyan-950/35 px-5 py-4 shadow-[0_24px_56px_-40px_rgba(124,58,237,0.45)]"
    >
      <p className="text-[15px] font-semibold text-zinc-100">
        Your library works harder when you reuse it
      </p>
      <p className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-zinc-400">
        Open what already performs well, tweak the angle in Generate, and ship a
        fresh variant — faster than tabbing to a blank prompt every morning.
      </p>
    </motion.div>
  );
}

function QuickRegenerateLink({ favorite }: { favorite: FavoriteRow }) {
  return (
    <Link
      href={favoriteRegenerateHref(favorite)}
      className="touch-manipulation inline-flex shrink-0 items-center rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-cyan-200 transition hover:bg-cyan-500/18"
    >
      Regenerate
    </Link>
  );
}

function RetentionRailsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-5 w-40 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="flex gap-3 overflow-hidden">
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="h-[132px] min-w-[220px] animate-pulse rounded-2xl bg-white/[0.05]"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ColdStartReuseTip() {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.12] bg-[#141a26]/60 px-5 py-4">
      <p className="text-sm font-medium text-zinc-200">
        Tip — open a saved pack once
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
        We surface &quot;Recently used&quot; and &quot;Most used&quot; after you
        view content here. Pick a favorite, tap View, then regenerate variants on
        your best topics.
      </p>
    </div>
  );
}

function FavoriteHighlightCard({
  favorite: f,
  onView,
}: {
  favorite: FavoriteRow;
  onView: () => void;
}) {
  return (
    <div className="flex min-w-[236px] max-w-[280px] shrink-0 flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161d2e]/95 to-[#0d111c]/95 p-4 shadow-xl transition hover:border-violet-500/25">
      <div className="flex items-start gap-3">
        <FavoritePlatformIcon platform={f.platform} className="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-white">
            {f.title}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            {f.usage_count > 0 ? `${f.usage_count} opens` : "Saved"}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <QuickRegenerateLink favorite={f} />
        <button
          type="button"
          onClick={onView}
          className="touch-manipulation rounded-xl border border-white/[0.1] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-200 transition hover:bg-white/[0.06]"
        >
          View
        </button>
      </div>
    </div>
  );
}

function FavoriteHighlightRail({
  title,
  subtitle,
  items,
  onViewFavorite,
}: {
  title: string;
  subtitle: string;
  items: FavoriteRow[];
  onViewFavorite: (f: FavoriteRow) => void;
}) {
  return (
    <section className="min-w-0 space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="text-[13px] leading-relaxed text-zinc-500">{subtitle}</p>
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 pt-1">
        {items.map((f) => (
          <FavoriteHighlightCard
            key={`${title}-${f.id}`}
            favorite={f}
            onView={() => onViewFavorite(f)}
          />
        ))}
      </div>
    </section>
  );
}

function RetentionHighlightRails({
  recentlyUsed,
  mostUsed,
  totalSaved,
  onViewFavorite,
}: {
  recentlyUsed: FavoriteRow[];
  mostUsed: FavoriteRow[];
  totalSaved: number;
  onViewFavorite: (f: FavoriteRow) => void;
}) {
  const showRails = recentlyUsed.length > 0 || mostUsed.length > 0;

  if (!showRails && totalSaved > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <ColdStartReuseTip />
      </motion.div>
    );
  }

  if (!showRails) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="grid gap-10 lg:grid-cols-2 lg:gap-12"
    >
      {recentlyUsed.length > 0 ? (
        <FavoriteHighlightRail
          title="Recently used"
          subtitle="Last opened packs — jump back into what you already trust."
          items={recentlyUsed}
          onViewFavorite={onViewFavorite}
        />
      ) : null}
      {mostUsed.length > 0 ? (
        <FavoriteHighlightRail
          title="Most used content"
          subtitle="Highest-impact saves — remix proven angles before inventing new ones."
          items={mostUsed}
          onViewFavorite={onViewFavorite}
        />
      ) : null}
    </motion.div>
  );
}

function FavoriteRowMore({ favorite }: { favorite: FavoriteRow }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const genHref = favoriteRegenerateHref(favorite);

  async function copyTitle() {
    try {
      await navigator.clipboard.writeText(favorite.title);
      setOpen(false);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="touch-manipulation rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="More actions"
      >
        ···
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[208px] rounded-xl border border-white/[0.1] bg-[#0f141f]/98 py-1.5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.85)] backdrop-blur-md"
        >
          <Link
            href={genHref}
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/[0.06]"
            onClick={() => setOpen(false)}
          >
            Open in Generate
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-white/[0.06]"
            onClick={() => void copyTitle()}
          >
            Copy title
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FilterCard({
  typeFilter,
  platformFilter,
  tagSearch,
  selectedTags,
  availableTags,
  onType,
  onPlatform,
  onTagSearch,
  onToggleTag,
  onClear,
}: {
  typeFilter: string;
  platformFilter: string;
  tagSearch: string;
  selectedTags: string[];
  availableTags: string[];
  onType: (v: string) => void;
  onPlatform: (v: string) => void;
  onTagSearch: (v: string) => void;
  onToggleTag: (tag: string) => void;
  onClear: () => void;
}) {
  const q = tagSearch.trim().toLowerCase();
  const visibleTags = availableTags.filter((t) =>
    q ? t.toLowerCase().includes(q) : true
  );

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111827]/90 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Filters
        </p>
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] font-semibold text-violet-400 hover:text-violet-300"
        >
          Clear all
        </button>
      </div>
      <div className="mt-4 space-y-4">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Content type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => onType(e.target.value)}
            className="mt-1.5 w-full cursor-pointer rounded-xl border border-white/[0.08] bg-[#0B0F19]/90 px-3 py-2.5 text-sm text-zinc-100 outline-none"
          >
            <option value="all">All types</option>
            <option value="hook">Hook</option>
            <option value="caption">Caption</option>
            <option value="script">Script</option>
            <option value="idea">Idea</option>
            <option value="full_pack">Full pack</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Platform
          </label>
          <select
            value={platformFilter}
            onChange={(e) => onPlatform(e.target.value)}
            className="mt-1.5 w-full cursor-pointer rounded-xl border border-white/[0.08] bg-[#0B0F19]/90 px-3 py-2.5 text-sm text-zinc-100 outline-none"
          >
            <option value="all">All platforms</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="linkedin">LinkedIn</option>
            <option value="x">X</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Tags
          </label>
          <input
            type="search"
            value={tagSearch}
            onChange={(e) => onTagSearch(e.target.value)}
            placeholder="Search tags…"
            className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#0B0F19]/90 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />
          {selectedTags.length > 0 ? (
            <p className="mt-2 text-[11px] text-violet-300/90">
              Filtering by {selectedTags.join(", ")}
            </p>
          ) : null}
          {availableTags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {visibleTags.slice(0, 24).map((t) => {
                const on = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onToggleTag(t)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition",
                      on
                        ? "border-violet-500/45 bg-violet-500/15 text-violet-200"
                        : "border-white/[0.07] bg-black/25 text-zinc-400 hover:border-white/[0.12]"
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-zinc-600">
              Tags on saved packs show up here for one-click filtering.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickActionsCard() {
  const links = [
    { href: "/dashboard/generate", label: "Create new content", hint: "Generator" },
    { href: "/dashboard/history", label: "Go to history", hint: "Past runs" },
    {
      href:
        "/dashboard/generate?seed_topic=" +
        encodeURIComponent(
          "Turn one viral clip into 5 posts — repurpose angle"
        ) +
        "&seed_platform=tiktok",
      label: "Repurpose content",
      hint: "Pre-filled topic",
    },
    { href: "/dashboard/templates", label: "Save as template", hint: "Presets" },
  ];
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-950/40 to-[#111827]/95 p-5 shadow-xl backdrop-blur-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        Quick actions
      </p>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 transition hover:border-violet-500/25 hover:bg-white/[0.06]"
            >
              <span className="text-sm font-semibold text-white">{l.label}</span>
              <span className="text-[11px] text-zinc-500">{l.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TEMPLATE_TOPICS = [
  {
    label: "TikTok Hook Template",
    topic:
      "Stop scrolling hook: one belief your audience won't admit out loud — reveal it in 3 seconds and flip it.",
    platform: "tiktok",
  },
  {
    label: "Instagram Post Template",
    topic:
      "Carousel opener: 5 signs you're ready for X — save this before your next launch.",
    platform: "instagram",
  },
  {
    label: "YouTube Script Template",
    topic:
      "Talking-head outline: bold claim → proof → mistake people make → step-by-step fix → subscribe CTA.",
    platform: "youtube",
  },
] as const;

function TemplatesCard() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111827]/90 p-5 shadow-xl backdrop-blur-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        Templates
      </p>
      <ul className="mt-4 space-y-2">
        {TEMPLATE_TOPICS.map((t) => (
          <li key={t.label}>
            <Link
              href={`/dashboard/generate?seed_topic=${encodeURIComponent(t.topic)}&seed_platform=${encodeURIComponent(t.platform)}`}
              className="block rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-white"
            >
              {t.label}
              <span className="mt-1 block text-[11px] font-normal text-zinc-500">
                Opens Generate with a starter topic
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyFavorites() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col items-center rounded-3xl border border-dashed border-white/[0.1] bg-[#111827]/40 px-8 py-16 text-center"
    >
      <div className="mb-8 flex h-36 w-36 items-center justify-center">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full drop-shadow-[0_20px_40px_rgba(124,58,237,0.25)]"
          aria-hidden
        >
          <defs>
            <linearGradient id="efg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="efg2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <rect
            x="12"
            y="22"
            width="96"
            height="76"
            rx="18"
            fill="url(#efg1)"
            stroke="url(#efg2)"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <path
            d="M38 48h44M38 58h32M38 68h38"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="78" cy="78" r="16" fill="rgba(124,58,237,0.35)" />
          <path
            d="M72 78l5 5 10-12"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.95"
          />
        </svg>
      </div>
      <p className="text-lg font-semibold text-white">
        You haven&apos;t saved anything yet
      </p>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-zinc-500">
        Generate a pack, then tap &quot;Save to favorites&quot; — your library
        builds here.
      </p>
      <Link
        href="/dashboard/generate"
        className="dash-btn-shine mt-8 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-10 text-[15px] font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110"
      >
        Generate Content
      </Link>
    </motion.div>
  );
}

function FavoritesListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

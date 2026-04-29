"use client";

import Link from "next/link";
import { memo } from "react";
import type { ContentOutput } from "@/types/content";
import type { EmphasisOption } from "@/lib/dashboard/generation-meta";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/dashboard/copy-button";

export type GenerationOutputViewProps = {
  output: ContentOutput;
  embedded?: boolean;
  emphasis?: EmphasisOption;
  /** Marketing / landing: emoji headers, punchier hook styling */
  variant?: "default" | "marketing";
  /** Blur scripts + caption + posts with upgrade overlay (conversion teaser) */
  paywallBlurBelowHooks?: boolean;
};

function visibility(emphasis: EmphasisOption | undefined) {
  const e = emphasis ?? "full";
  if (e === "full") {
    return {
      hooks: true,
      scripts: true,
      caption: true,
      posts: true,
    };
  }
  if (e === "ideas") {
    return { hooks: true, scripts: false, caption: false, posts: true };
  }
  return {
    hooks: e === "hooks",
    scripts: e === "scripts",
    caption: e === "caption",
    posts: e === "posts" || e === "hashtags",
  };
}

function sectionTitles(
  emphasis: EmphasisOption | undefined,
  variant: "default" | "marketing"
) {
  const m = variant === "marketing";
  const hooksLabel =
    emphasis === "ideas"
      ? m
        ? "💡 Ideas"
        : "Ideas"
      : m
        ? "🪝 Hooks"
        : "Hooks";
  const scriptsLabel = m ? "🎬 Scripts" : "Scripts";
  const captionLabel = m ? "✍️ Caption" : "Caption";
  const postsLabel =
    emphasis === "hashtags"
      ? m
        ? "📱 Posts & hashtags"
        : "Posts & hashtags"
      : m
        ? "📱 Posts"
        : "Posts";
  return { hooksLabel, scriptsLabel, captionLabel, postsLabel };
}

function GenerationOutputViewInner({
  output,
  embedded,
  emphasis,
  variant = "default",
  paywallBlurBelowHooks = false,
}: GenerationOutputViewProps) {
  const v = visibility(emphasis);
  const { hooksLabel, scriptsLabel, captionLabel, postsLabel } = sectionTitles(
    emphasis,
    variant
  );

  const accentBar = (
    <span
      className="mt-0.5 h-9 w-1 shrink-0 rounded-full bg-gradient-to-b from-[#7C3AED] via-[#2563EB] to-[#22D3EE]"
      aria-hidden
    />
  );

  const marketing = variant === "marketing";

  const packSections = (
    <>
      {v.scripts && (
        <section>
          <div className="mb-6 flex items-start gap-4">
            {accentBar}
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                {scriptsLabel}
              </h3>
              <p className="mt-1 text-[13px] text-zinc-500">
                {marketing
                  ? "✨ ~30s beats — camera-ready"
                  : "~30s beats — ready to record"}
              </p>
            </div>
          </div>
          <div className="space-y-4 md:space-y-5">
            {output.scripts.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl border border-white/[0.06] bg-[#111827] p-5 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:p-6 lg:p-7",
                  embedded && "bg-[#111827]/75"
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <h4 className="min-w-0 text-lg font-semibold tracking-tight text-white">
                    {s.title}
                  </h4>
                  <CopyButton
                    text={`${s.title}\n\n${s.content}`}
                    className="touch-manipulation shrink-0 self-end sm:self-start"
                  />
                </div>
                <pre className="mt-4 whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-zinc-300">
                  {s.content}
                </pre>
              </div>
            ))}
          </div>
        </section>
      )}

      {v.caption && (
        <section>
          <div className="mb-6 flex items-start gap-4">
            {accentBar}
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                {captionLabel}
              </h3>
              <p className="mt-1 text-[13px] text-zinc-500">
                {marketing ? "🔥 Feed-ready + emoji mix" : "Feed-ready with emojis"}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#111827] p-5 text-[15px] leading-relaxed text-zinc-100 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:flex-row sm:gap-4 sm:p-6",
              embedded && "bg-[#111827]/75"
            )}
          >
            <p className="min-w-0 flex-1 whitespace-pre-wrap">{output.caption}</p>
            <CopyButton
              text={output.caption}
              className="touch-manipulation shrink-0 self-end sm:self-start"
            />
          </div>
        </section>
      )}

      {v.posts && (
        <section>
          <div className="mb-6 flex items-start gap-4">
            {accentBar}
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                {postsLabel}
              </h3>
              <p className="mt-1 text-[13px] text-zinc-500">
                {marketing ? "📆 Stagger-ready lines" : "Stagger-ready feed lines"}
              </p>
            </div>
          </div>
          <ul className="space-y-3 md:space-y-4">
            {output.posts.map((p, i) => (
              <li
                key={i}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#111827] p-4 text-[15px] leading-relaxed text-zinc-100 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.55)] backdrop-blur-sm transition hover:border-cyan-500/15 sm:flex-row sm:items-start sm:gap-4 sm:p-5",
                  embedded && "bg-[#111827]/75"
                )}
              >
                <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                  <span className="font-mono text-xs text-zinc-500">{i + 1}</span>
                  <p className="min-w-0 flex-1 whitespace-pre-wrap">{p}</p>
                </div>
                <CopyButton
                  text={p}
                  className="touch-manipulation self-end sm:self-start"
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );

  const showPack = v.scripts || v.caption || v.posts;

  return (
    <div
      className={cn(
        "space-y-12 md:space-y-14 lg:space-y-16",
        !embedded && "mt-8 md:mt-10",
        embedded && "space-y-8 md:space-y-10 lg:space-y-12"
      )}
    >
      {v.hooks && (
        <section
          className={cn(marketing && "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 md:p-6")}
        >
          <div className="mb-6 flex items-start gap-4">
            {accentBar}
            <div className="min-w-0">
              <h3 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                {hooksLabel}
              </h3>
              <p className="mt-1 text-[13px] text-zinc-500">
                {emphasis === "ideas"
                  ? marketing
                    ? "Angles you can ship today"
                    : "Angles you can riff into hooks or posts"
                  : marketing
                    ? "⚡ Scroll-stopping openers"
                    : "High-impact openings"}
              </p>
            </div>
          </div>
          <ul className="space-y-3 md:space-y-4">
            {output.hooks.map((h, i) => (
              <li
                key={i}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#111827] p-4 text-[15px] leading-relaxed text-zinc-100 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.55)] backdrop-blur-sm transition sm:flex-row sm:items-start sm:gap-4 sm:p-5",
                  marketing &&
                    "border-cyan-500/25 ring-1 ring-cyan-500/15 shadow-[0_0_48px_-16px_rgba(34,211,238,0.22)] hover:border-cyan-500/25",
                  !marketing &&
                    "hover:border-cyan-500/15",
                  embedded && "bg-[#111827]/75"
                )}
              >
                <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                  <span
                    className={cn(
                      marketing
                        ? "shrink-0 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/15 px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-cyan-200/90"
                        : "font-mono text-xs text-zinc-500"
                    )}
                  >
                    {marketing ? `#${i + 1}` : i + 1}
                  </span>
                  <p
                    className={cn(
                      "min-w-0 flex-1",
                      marketing ? "font-medium text-zinc-50" : "text-zinc-100"
                    )}
                  >
                    {h}
                  </p>
                </div>
                <CopyButton
                  text={h}
                  className="touch-manipulation self-end sm:self-start"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {showPack && (
        <div
          className={cn(
            paywallBlurBelowHooks && "relative overflow-hidden rounded-[28px]"
          )}
        >
          <div
            className={cn(
              "space-y-12 md:space-y-14 lg:space-y-16",
              paywallBlurBelowHooks &&
                "pointer-events-none max-h-[520px] select-none blur-[9px] brightness-[0.85]"
            )}
          >
            {packSections}
          </div>

          {paywallBlurBelowHooks && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-[28px] border border-primary/25 bg-[#07090f]/90 px-6 py-10 text-center backdrop-blur-md">
              <p className="text-xl font-semibold tracking-tight text-white">
                Upgrade to Pro
              </p>
              <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
                Unlock the full script pack, captions, and unlimited regenerations — built for creators who post daily.
              </p>
              <div className="mt-2 flex w-full max-w-xs flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/pricing"
                  className="touch-manipulation inline-flex min-h-[52px] min-w-[160px] flex-1 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  View plans
                </Link>
                <Link
                  href="/register"
                  className="touch-manipulation inline-flex min-h-[52px] min-w-[160px] flex-1 items-center justify-center rounded-2xl border border-white/15 bg-transparent px-6 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Start free
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const GenerationOutputView = memo(GenerationOutputViewInner);

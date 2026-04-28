"use client";

import { memo } from "react";
import type { ContentOutput } from "@/types/content";
import type { EmphasisOption } from "@/lib/dashboard/generation-meta";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/dashboard/copy-button";

export type GenerationOutputViewProps = {
  output: ContentOutput;
  embedded?: boolean;
  /** Hide sections so focused tools show only relevant slices (full pack still stored). */
  emphasis?: EmphasisOption;
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

function GenerationOutputViewInner({
  output,
  embedded,
  emphasis,
}: GenerationOutputViewProps) {
  const v = visibility(emphasis);

  const hooksHeading =
    emphasis === "ideas" ? "Ideas" : "Hooks";
  const scriptsHeading = "Scripts";
  const captionHeading = "Caption";
  const postsHeading = emphasis === "hashtags" ? "Posts & hashtags" : "Posts";

  const accentBar = (
    <span
      className="mt-0.5 h-9 w-1 shrink-0 rounded-full bg-gradient-to-b from-[#7C3AED] via-[#2563EB] to-[#22D3EE]"
      aria-hidden
    />
  );

  return (
    <div
      className={cn(
        "space-y-12 md:space-y-14 lg:space-y-16",
        !embedded && "mt-8 md:mt-10",
        embedded && "space-y-8 md:space-y-10 lg:space-y-12"
      )}
    >
      {v.hooks && (
        <section>
          <div className="mb-6 flex items-start gap-4">
            {accentBar}
            <div className="min-w-0">
              <h3 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                {hooksHeading}
              </h3>
              <p className="mt-1 text-[13px] text-zinc-500">
                {emphasis === "ideas"
                  ? "Angles you can riff into hooks or posts"
                  : "High-impact openings"}
              </p>
            </div>
          </div>
          <ul className="space-y-3 md:space-y-4">
            {output.hooks.map((h, i) => (
              <li
                key={i}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#111827] p-4 text-[15px] leading-relaxed text-zinc-100 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.55)] backdrop-blur-sm transition hover:border-cyan-500/15 sm:flex-row sm:items-start sm:gap-4 sm:p-5",
                  embedded && "bg-[#111827]/75"
                )}
              >
                <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                  <span className="font-mono text-xs text-zinc-500">{i + 1}</span>
                  <p className="min-w-0 flex-1 text-zinc-100">{h}</p>
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

      {v.scripts && (
        <section>
          <div className="mb-6 flex items-start gap-4">
            {accentBar}
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                {scriptsHeading}
              </h3>
              <p className="mt-1 text-[13px] text-zinc-500">
                ~30s beats — ready to record
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
                <pre className="mt-4 whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-zinc-400">
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
                {captionHeading}
              </h3>
              <p className="mt-1 text-[13px] text-zinc-500">
                Feed-ready with emojis
              </p>
            </div>
          </div>
          <div
            className={cn(
              "flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#111827] p-5 text-[15px] leading-relaxed text-zinc-100 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:flex-row sm:gap-4 sm:p-6",
              embedded && "bg-[#111827]/75"
            )}
          >
            <p className="min-w-0 flex-1">{output.caption}</p>
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
                {postsHeading}
              </h3>
              <p className="mt-1 text-[13px] text-zinc-500">
                Stagger-ready feed lines
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
    </div>
  );
}

export const GenerationOutputView = memo(GenerationOutputViewInner);

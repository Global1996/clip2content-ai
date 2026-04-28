"use client";

import Link from "next/link";
import { memo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { ContentOutput } from "@/types/content";
import type { EmphasisOption } from "@/lib/dashboard/generation-meta";
import {
  DEFAULT_GENERATION_OPTIONS,
  LANGUAGE_OPTIONS,
  LENGTH_OPTIONS,
  PLATFORM_OPTIONS,
  TONE_OPTIONS,
} from "@/lib/dashboard/generation-meta";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { ErrorAlert } from "@/components/ui/error-alert";
import { serializeGenerationPlainText } from "@/lib/content/serialize-generation";
import { CopyButton } from "@/components/dashboard/copy-button";
import { DownloadPackButton } from "@/components/dashboard/download-pack-button";
import { GenerationOutputView } from "@/components/dashboard/generation-output-view";
import { useDashboardData } from "@/components/dashboard/dashboard-context";
import { FreeQuotaConversionBanner } from "@/components/dashboard/upgrade-conversion";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

const EXAMPLE_TOPIC = `Why your first week on a new habit feels chaotic — one mindset shift that keeps you consistent (without burnout).`;

export const GenerationWorkspace = memo(function GenerationWorkspace({
  emphasis = "full",
  heading,
  showHeading = true,
  submitLabel = "Generate Content",
}: {
  emphasis?: EmphasisOption;
  heading?: string;
  showHeading?: boolean;
  submitLabel?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const motionDur = prefersReducedMotion ? 0 : 0.2;
  const { refresh } = useDashboardData();

  const [topic, setTopic] = useState("");
  const debouncedTopic = useDebouncedValue(topic, 350);
  const [tone, setTone] = useState(DEFAULT_GENERATION_OPTIONS.tone);
  const [platform, setPlatform] = useState(DEFAULT_GENERATION_OPTIONS.platform);
  const [language, setLanguage] = useState(DEFAULT_GENERATION_OPTIONS.language);
  const [length, setLength] = useState<
    "short" | "medium" | "long"
  >(DEFAULT_GENERATION_OPTIONS.length);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    topic: string;
    output: ContentOutput;
  } | null>(null);

  function applyExample() {
    setTopic(EXAMPLE_TOPIC);
    setTone("Engaging");
    setPlatform("tiktok");
    setLanguage("en");
    setLength("medium");
  }

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    const raw = topic.trim();
    if (!raw) return;
    setLoading(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          topic: raw,
          options: {
            tone,
            platform,
            language,
            length,
            emphasis,
          },
        }),
      });
      let data: {
        error?: string;
        output?: ContentOutput;
        topic?: string;
        id?: string;
      };
      try {
        data = await res.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }
      if (!res.ok) {
        const msg =
          typeof data.error === "string" ? data.error : "Generation failed.";
        if (res.status === 401) {
          throw new Error("Your session expired. Sign in again.");
        }
        throw new Error(msg);
      }
      if (!data.output || data.topic === undefined || !data.id) {
        throw new Error("Incomplete response from server.");
      }
      setResult({
        id: data.id,
        topic: data.topic,
        output: data.output,
      });
      await refresh({ silent: true });
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-7">
      {showHeading && heading && (
        <h2 className="text-lg font-semibold text-white">{heading}</h2>
      )}

      {generateError && (
        <ErrorAlert
          title="Something went wrong"
          onDismiss={() => setGenerateError(null)}
          variant="danger"
        >
          <p>{generateError}</p>
          {(generateError.toLowerCase().includes("limit") ||
            generateError.includes("Free plan")) && (
            <p className="mt-2">
              <Link
                href="/pricing"
                className="font-semibold text-violet-400 underline-offset-4 hover:underline"
              >
                Upgrade to Pro — unlimited generations
              </Link>
            </p>
          )}
        </ErrorAlert>
      )}

      <FreeQuotaConversionBanner />

      <motion.div
        layout
        transition={{
          layout: {
            duration: motionDur + 0.08,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
        className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827]/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl transition-[border-color,box-shadow] duration-300 ease-out hover:border-white/[0.11] hover:shadow-[0_28px_56px_-36px_rgba(0,0,0,0.65)] sm:p-8"
      >
        <form onSubmit={onGenerate} className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor="gen-topic"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500"
            >
              What do you want to create?
            </label>
            <button
              type="button"
              onClick={applyExample}
              disabled={loading}
              className="shrink-0 rounded-xl border border-violet-500/35 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-50"
            >
              Try example
            </button>
          </div>
          <div className="relative">
            <textarea
              id="gen-topic"
              rows={6}
              value={topic}
              disabled={loading}
              onChange={(e) => setTopic(e.target.value)}
              placeholder='e.g. "5 mistakes everyone makes before their first marathon — and how to skip them"'
              className="min-h-[168px] w-full resize-y rounded-2xl border border-white/[0.08] bg-[#0B0F19]/80 px-4 pb-11 pt-4 text-[15px] leading-relaxed text-zinc-100 placeholder:text-zinc-600 outline-none ring-offset-0 ring-offset-[#111827]/80 transition-[border-color,box-shadow] duration-200 ease-out focus:border-violet-500/45 focus:shadow-[inset_0_0_0_1px_rgba(139,92,246,0.35),0_0_0_3px_rgba(139,92,246,0.12)] focus:ring-0 disabled:opacity-50"
              aria-describedby="gen-topic-counter"
            />
            <span
              id="gen-topic-counter"
              className="pointer-events-none absolute bottom-3 right-4 text-[11px] tabular-nums text-zinc-500"
              aria-live="polite"
            >
              {debouncedTopic.length.toLocaleString()} chars
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-4 xl:grid-cols-4 xl:gap-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={loading}
                className="mt-2 w-full cursor-pointer rounded-xl border border-white/[0.08] bg-[#0B0F19]/80 px-4 py-3 text-sm text-zinc-100 outline-none transition-[border-color,background-color] duration-200 ease-out hover:border-white/[0.13] focus:border-violet-500/45 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] disabled:opacity-50"
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                disabled={loading}
                className="mt-2 w-full cursor-pointer rounded-xl border border-white/[0.08] bg-[#0B0F19]/80 px-4 py-3 text-sm text-zinc-100 outline-none transition-[border-color,background-color] duration-200 ease-out hover:border-white/[0.13] focus:border-violet-500/45 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] disabled:opacity-50"
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={loading}
                className="mt-2 w-full cursor-pointer rounded-xl border border-white/[0.08] bg-[#0B0F19]/80 px-4 py-3 text-sm text-zinc-100 outline-none transition-[border-color,background-color] duration-200 ease-out hover:border-white/[0.13] focus:border-violet-500/45 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] disabled:opacity-50"
              >
                {LANGUAGE_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Length
              </label>
              <select
                value={length}
                onChange={(e) =>
                  setLength(e.target.value as "short" | "medium" | "long")
                }
                disabled={loading}
                className="mt-2 w-full cursor-pointer rounded-xl border border-white/[0.08] bg-[#0B0F19]/80 px-4 py-3 text-sm text-zinc-100 outline-none transition-[border-color,background-color] duration-200 ease-out hover:border-white/[0.13] focus:border-violet-500/45 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] disabled:opacity-50"
              >
                {LENGTH_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <motion.button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.992 }}
              transition={{ type: "spring", stiffness: 520, damping: 38 }}
              className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-left text-sm font-medium text-zinc-300 transition-[border-color,background-color] duration-200 ease-out hover:border-white/[0.1] hover:bg-white/[0.055] active:bg-white/[0.07]"
            >
              Advanced options
              <motion.span
                animate={{ rotate: advancedOpen ? 180 : 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block text-zinc-500"
              >
                ▾
              </motion.span>
            </motion.button>
            <AnimatePresence initial={false}>
              {advancedOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: motionDur }}
                  className="overflow-hidden"
                >
                  <ul className="mt-3 list-inside list-disc rounded-xl border border-white/[0.06] bg-[#0B0F19]/50 px-4 py-3 text-sm leading-relaxed text-zinc-500">
                    <li>
                      Creative focus follows your active tool (hooks, captions,
                      etc.).
                    </li>
                    <li>
                      Length steers density — output stays schema-complete for
                      history compatibility.
                    </li>
                    <li>
                      Templates & Brand Voice shortcuts ship via the right panel.
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {loading && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-4 rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/[0.12] to-blue-600/[0.06] px-4 py-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            >
              <Spinner className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" />
              <div className="text-sm">
                <p className="font-medium text-white">Generating…</p>
                <p className="mt-1 text-zinc-400">
                  Structured hooks, scripts, caption & posts — usually under a
                  minute.
                </p>
              </div>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading || !topic.trim()}
            whileHover={
              prefersReducedMotion || loading
                ? undefined
                : {
                    scale: 1.008,
                    transition: { type: "spring", stiffness: 480, damping: 28 },
                  }
            }
            whileTap={
              prefersReducedMotion || loading
                ? undefined
                : { scale: 0.987, transition: { duration: 0.12 } }
            }
            className={cn(
              "dash-btn-shine relative z-0 w-full overflow-hidden rounded-2xl py-[15px] text-[15px] font-semibold text-white shadow-lg shadow-violet-500/25 transition-[filter] duration-200 ease-out hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] disabled:pointer-events-none disabled:opacity-40 sm:py-4",
              "bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600"
            )}
          >
            <span className="relative z-10 inline-flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Spinner className="h-5 w-5 text-white" />
                  Working…
                </>
              ) : (
                submitLabel
              )}
            </span>
          </motion.button>
        </form>
      </motion.div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="out"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{
              duration: motionDur + 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="rounded-2xl border border-white/[0.06] bg-[#111827]/60 p-6 shadow-xl shadow-black/30 backdrop-blur-md transition-[border-color,box-shadow] duration-300 ease-out hover:border-white/[0.1] hover:shadow-[0_24px_48px_-32px_rgba(0,0,0,0.55)] sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Prompt snapshot
                </p>
                <p className="mt-2 line-clamp-4 text-lg font-semibold text-white sm:text-xl">
                  {result.topic}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <CopyButton
                  label="Copy full pack"
                  copiedLabel="Copied pack"
                  text={serializeGenerationPlainText(
                    result.topic,
                    result.output
                  )}
                  className="border-violet-500/35 bg-violet-500/15 text-violet-200 hover:bg-violet-500/25"
                />
                <DownloadPackButton
                  topic={result.topic}
                  output={result.output}
                  className="border-white/[0.1] bg-white/[0.05] text-zinc-100 hover:bg-white/[0.08]"
                />
              </div>
            </div>
            <div className="mt-8 border-t border-white/[0.06] pt-8 text-zinc-100">
              <GenerationOutputView
                output={result.output}
                emphasis={emphasis}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

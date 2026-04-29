"use client";

import Link from "next/link";
import { memo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ContentOutput } from "@/types/content";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { ErrorAlert } from "@/components/ui/error-alert";
import { serializeGenerationPlainText } from "@/lib/content/serialize-generation";
import { CopyButton } from "@/components/dashboard/copy-button";
import { DownloadPackButton } from "@/components/dashboard/download-pack-button";
import { GenerationOutputView } from "@/components/dashboard/generation-output-view";
import { useDashboardData } from "@/components/dashboard/dashboard-context";
import {
  ONBOARDING_METADATA_KEY,
  ONBOARDING_NICHES,
  ONBOARDING_PLATFORMS,
  ONBOARDING_TOPIC_BY_NICHE,
  type OnboardingNicheId,
  type OnboardingPlatformId,
} from "@/lib/dashboard/onboarding";
import { DEFAULT_GENERATION_OPTIONS } from "@/lib/dashboard/generation-meta";
import { createClient } from "@/lib/supabase/client";

type Step = "welcome" | "setup" | "generate" | "celebrate";

export const OnboardingWizard = memo(function OnboardingWizard() {
  const { refresh } = useDashboardData();

  const [step, setStep] = useState<Step>("welcome");
  const [platform, setPlatform] = useState<OnboardingPlatformId | null>(null);
  const [niche, setNiche] = useState<OnboardingNicheId | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    topic: string;
    output: ContentOutput;
  } | null>(null);

  const platformLabel = ONBOARDING_PLATFORMS.find((p) => p.id === platform)?.label;
  const nicheLabel = ONBOARDING_NICHES.find((n) => n.id === niche)?.label;

  const goSetup = useCallback(() => setStep("setup"), []);

  const goGenerate = useCallback(() => {
    if (!platform || !niche) return;
    setTopic(ONBOARDING_TOPIC_BY_NICHE[niche]);
    setStep("generate");
  }, [platform, niche]);

  const onGenerate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!platform || !niche) return;
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
              tone: DEFAULT_GENERATION_OPTIONS.tone,
              platform,
              language: DEFAULT_GENERATION_OPTIONS.language,
              length: DEFAULT_GENERATION_OPTIONS.length,
              emphasis: "full",
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

        const supabase = createClient();
        await supabase.auth.updateUser({
          data: {
            [ONBOARDING_METADATA_KEY]: true,
            virlo_onboarding_platform: platform,
            virlo_onboarding_niche: niche,
          },
        });

        await refresh({ silent: true });
        setStep("celebrate");
      } catch (err) {
        setGenerateError(
          err instanceof Error ? err.message : "Generation failed."
        );
      } finally {
        setLoading(false);
      }
    },
    [platform, niche, topic, refresh]
  );

  const fadeMotion = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <div className="mx-auto w-full max-w-3xl pb-16 lg:pb-24">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.section
            key="welcome"
            {...fadeMotion}
            className="flex flex-col items-center rounded-3xl border border-white/[0.08] bg-[#111827]/70 px-6 py-14 text-center shadow-2xl shadow-black/40 backdrop-blur-md sm:px-12 sm:py-16"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Quick start
            </p>
            <h1 className="mt-5 text-[clamp(1.75rem,5vw,2.35rem)] font-semibold tracking-tight text-white">
              Welcome to Virlo 👋
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[17px] leading-relaxed text-zinc-400">
              Let&apos;s create your first viral content
            </p>
            <button
              type="button"
              onClick={goSetup}
              className="touch-manipulation mt-10 inline-flex min-h-[52px] min-w-[200px] items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600 px-10 text-[15px] font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110"
            >
              Start
            </button>
          </motion.section>
        )}

        {step === "setup" && (
          <motion.section
            key="setup"
            {...fadeMotion}
            className="rounded-3xl border border-white/[0.08] bg-[#111827]/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-10"
          >
            <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">
              Tailor your first pack
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-[15px] text-zinc-400">
              Pick a platform and niche — we&apos;ll shape hooks and pacing for that combo.
            </p>

            <div className="mt-10 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Platform
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {ONBOARDING_PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={cn(
                      "touch-manipulation rounded-2xl border px-4 py-4 text-[15px] font-semibold transition",
                      platform === p.id
                        ? "border-violet-500/55 bg-violet-500/15 text-white shadow-[0_0_0_1px_rgba(139,92,246,0.35)]"
                        : "border-white/[0.08] bg-[#0B0F19]/80 text-zinc-300 hover:border-white/[0.14]"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Niche
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {ONBOARDING_NICHES.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setNiche(n.id)}
                    className={cn(
                      "touch-manipulation rounded-2xl border px-4 py-4 text-left text-[15px] font-semibold transition",
                      niche === n.id
                        ? "border-cyan-500/45 bg-cyan-500/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.35)]"
                        : "border-white/[0.08] bg-[#0B0F19]/80 text-zinc-300 hover:border-white/[0.14]"
                    )}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!platform || !niche}
              onClick={goGenerate}
              className="touch-manipulation mt-10 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-[15px] font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
            >
              Continue
            </button>
          </motion.section>
        )}

        {step === "generate" && (
          <motion.section key="generate" {...fadeMotion} className="space-y-6">
            {generateError && (
              <ErrorAlert
                title="Something went wrong"
                onDismiss={() => setGenerateError(null)}
                variant="danger"
              >
                <p>{generateError}</p>
              </ErrorAlert>
            )}

            <div className="rounded-3xl border border-white/[0.08] bg-[#111827]/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
              <div className="flex flex-wrap gap-2 text-[13px] text-zinc-400">
                {platformLabel && nicheLabel ? (
                  <>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 font-medium text-zinc-200">
                      {platformLabel}
                    </span>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 font-medium text-zinc-200">
                      {nicheLabel}
                    </span>
                  </>
                ) : null}
              </div>
              <h2 className="mt-6 text-xl font-semibold text-white sm:text-2xl">
                Your first topic
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">
                We started you with a proven angle — tweak it or generate as-is.
              </p>

              <form onSubmit={onGenerate} className="mt-8 space-y-6">
                <div>
                  <label
                    htmlFor="onb-topic"
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
                  >
                    Topic
                  </label>
                  <textarea
                    id="onb-topic"
                    rows={5}
                    value={topic}
                    disabled={loading}
                    onChange={(e) => setTopic(e.target.value)}
                    className="mt-3 min-h-[140px] w-full resize-y rounded-2xl border border-white/[0.08] bg-[#0B0F19]/80 px-4 py-4 text-[15px] leading-relaxed text-zinc-100 outline-none transition focus:border-violet-500/45 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)] disabled:opacity-50"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                  className={cn(
                    "relative z-0 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl py-[15px] text-[15px] font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-40",
                    "bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600"
                  )}
                >
                  {loading ? (
                    <>
                      <Spinner className="h-5 w-5 text-white" />
                      Generating…
                    </>
                  ) : (
                    "Generate First Content"
                  )}
                </motion.button>
              </form>
            </div>
          </motion.section>
        )}

        {step === "celebrate" && result && (
          <motion.section key="celebrate" {...fadeMotion} className="space-y-8">
            <div className="relative rounded-3xl border border-amber-400/35 bg-gradient-to-b from-amber-500/10 to-transparent p-1 shadow-[0_0_60px_-18px_rgba(251,191,36,0.45)]">
              <div className="rounded-[22px] bg-[#111827]/95 p-5 sm:p-8">
                <div className="mx-auto mb-6 max-w-lg rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-4 text-center">
                  <p className="text-lg font-semibold text-amber-100">
                    This could go viral 🔥
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Nice — here&apos;s your first structured pack. Copy what you love and ship it today.
                  </p>
                </div>

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

                <div className="relative mt-8 rounded-2xl ring-2 ring-amber-400/25 ring-offset-2 ring-offset-[#111827]">
                  <div className="border-t border-white/[0.06] pt-8 text-zinc-100">
                    <GenerationOutputView output={result.output} emphasis="full" />
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/dashboard"
                    className="touch-manipulation inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 text-[15px] font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 sm:max-w-xs"
                  >
                    Continue to dashboard
                  </Link>
                  <Link
                    href="/dashboard/generate"
                    className="touch-manipulation inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-white/[0.12] px-8 text-[15px] font-medium text-zinc-200 transition hover:bg-white/[0.06] sm:max-w-xs"
                  >
                    Create another
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
});

"use client";

import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import type { ContentOutput } from "@/types/content";
import { GenerationOutputView } from "@/components/dashboard/generation-output-view";
import {
  DEMO_PRESETS,
  isDemoPresetId,
} from "@/components/landing/demo-presets";

type DemoMeta = { max: number; used: number; remaining: number };

async function fetchDemoMeta(): Promise<DemoMeta> {
  const res = await fetch("/api/generate/demo", { cache: "no-store" });
  if (!res.ok) {
    return { max: 2, used: 0, remaining: 2 };
  }
  return res.json();
}

function LandingLiveDemoSkeleton() {
  return (
    <section
      id="live-demo"
      className="scroll-mt-24 border-y border-border-subtle bg-background/50 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl lg:max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl animate-pulse text-center">
          <div className="mx-auto h-4 w-24 rounded bg-muted/40" />
          <div className="mx-auto mt-4 h-10 max-w-md rounded-lg bg-muted/30" />
          <div className="mx-auto mt-4 h-4 max-w-lg rounded bg-muted/25" />
        </div>
        <div className="mx-auto max-w-3xl rounded-3xl border border-border-subtle bg-surface/80 p-6 shadow-soft-lg">
          <div className="h-32 animate-pulse rounded-2xl bg-muted/20" />
        </div>
      </div>
    </section>
  );
}

function LandingLiveDemoInner() {
  const searchParams = useSearchParams();
  const presetParam = searchParams.get("preset");

  const [topic, setTopic] = useState("");

  const [meta, setMeta] = useState<DemoMeta | null>(null);
  const [output, setOutput] = useState<ContentOutput | null>(null);
  const [remainingAfterGen, setRemainingAfterGen] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchDemoMeta().then(setMeta);
  }, []);

  // Sync topic with the URL `preset` query param (external router state).
  useEffect(() => {
    if (!presetParam || !isDemoPresetId(presetParam)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTopic(DEMO_PRESETS[presetParam].topic);
  }, [presetParam]);

  useEffect(() => {
    if (!presetParam || !isDemoPresetId(presetParam)) return;
    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      document.getElementById("live-demo")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [presetParam]);

  const exhausted = meta !== null && meta.remaining <= 0;
  const blurPack = remainingAfterGen === 0;

  const handleGenerate = useCallback(() => {
    const trimmed = topic.trim();
    if (!trimmed || exhausted) return;

    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/generate/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed }),
      });

      const data = (await res.json()) as {
        error?: string;
        code?: string;
        output?: ContentOutput;
        remaining?: number;
        max?: number;
        used?: number;
      };

      if (!res.ok) {
        if (data.code === "DEMO_LIMIT") {
          setMeta({
            max: typeof data.max === "number" ? data.max : 2,
            used: typeof data.used === "number" ? data.used : 2,
            remaining: 0,
          });
        }
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      if (data.output) {
        setOutput(data.output);
        const rem =
          typeof data.remaining === "number" ? data.remaining : null;
        setRemainingAfterGen(rem);
        setMeta({
          max: typeof data.max === "number" ? data.max : 2,
          used: typeof data.used === "number" ? data.used : 0,
          remaining: typeof data.remaining === "number" ? data.remaining : 0,
        });
      }
    });
  }, [topic, exhausted]);

  const triesLabel = useMemo(() => {
    if (!meta) return null;
    const { remaining } = meta;
    if (remaining <= 0) return "No free previews left";
    return `${remaining} free preview${remaining === 1 ? "" : "s"} left`;
  }, [meta]);

  return (
    <section
      id="live-demo"
      className="scroll-mt-24 border-y border-border-subtle bg-background/50 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl lg:max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Live demo
          </p>
          <h2 className="mt-4 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-tight text-foreground">
            Generate real hooks &amp; scripts — no account needed
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Drop a topic and see Virlo&apos;s structure instantly.{" "}
            <span className="text-foreground/90">
              Two free previews per browser
            </span>
            ; unlock the full pack when you&apos;re ready.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl"
        >
          <div className="rounded-3xl border border-border-subtle bg-surface shadow-soft-lg">
            <div className="flex flex-col gap-4 border-b border-border-subtle px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-primary/15 px-3 py-1 font-medium text-primary">
                  {triesLabel ?? "…"}
                </span>
              </div>
              <Link
                href="/register"
                className="text-sm font-semibold text-muted underline-offset-4 hover:text-primary hover:underline"
              >
                Need more? Create a free account →
              </Link>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Topic
                </span>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={exhausted || isPending}
                  placeholder="e.g. Why cold showers didn't fix my discipline — what actually did"
                  rows={4}
                  className="mt-3 min-h-[140px] w-full resize-y rounded-2xl border border-border-subtle bg-background/80 px-4 py-4 text-base leading-relaxed text-foreground placeholder:text-muted/80 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 sm:min-h-[120px] sm:text-[17px]"
                />
              </label>

              {error ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                  {error}{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-white underline underline-offset-2"
                  >
                    Sign up free
                  </Link>
                </div>
              ) : null}

              {exhausted ? (
                <div className="rounded-2xl border border-primary/25 bg-primary/10 px-4 py-5 text-center">
                  <p className="font-semibold text-foreground">
                    You&apos;ve used your free live previews in this browser.
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    Create a free account for daily generations and the full
                    workflow.
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                      href="/register"
                      className="touch-manipulation inline-flex min-h-[56px] flex-1 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-white shadow-glow transition hover:brightness-110 sm:max-w-xs"
                    >
                      Try Free — no card
                    </Link>
                    <Link
                      href="/pricing"
                      className="touch-manipulation inline-flex min-h-[56px] flex-1 items-center justify-center rounded-2xl border border-white/15 px-8 text-base font-medium text-foreground transition hover:bg-white/5 sm:max-w-xs"
                    >
                      View Pro
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isPending || !topic.trim()}
                  className="touch-manipulation w-full min-h-[56px] rounded-2xl bg-primary px-8 text-base font-semibold text-white shadow-glow transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45 sm:min-h-[52px] sm:text-lg"
                >
                  {isPending ? "Generating…" : "Generate preview"}
                </button>
              )}

              <p className="text-center text-xs text-muted">
                No login required. {" "}
                <span className="text-foreground/80">
                  Previews are stored per browser (cookie).
                </span>
              </p>
            </div>
          </div>

          {output ? (
            <div className="mt-10 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#07090f] p-4 shadow-[0_32px_90px_-40px_rgba(0,0,0,0.85)] sm:p-6 md:p-8">
              <GenerationOutputView
                output={output}
                variant="marketing"
                paywallBlurBelowHooks={blurPack}
              />
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}

export function LandingLiveDemo() {
  return (
    <Suspense fallback={<LandingLiveDemoSkeleton />}>
      <LandingLiveDemoInner />
    </Suspense>
  );
}

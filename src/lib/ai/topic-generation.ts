import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  validateContentOutput,
  type ContentOutput,
} from "@/types/content";

/** Matches dashboard / DB shape — structured JSON only (OpenAI json_object mode). */
export const VIRAL_CONTENT_SYSTEM = `You are a viral content expert. Create engaging, emotional, high-converting short-form content.

Respond with ONE JSON object only. No markdown fences, no prose before or after.

Exact shape:
{
  "hooks": ["...", "...", "...", "...", "..."],
  "scripts": [
    { "title": "...", "content": "..." },
    { "title": "...", "content": "..." },
    { "title": "...", "content": "..." }
  ],
  "caption": "...",
  "posts": ["...", "...", "...", "...", "..."]
}

Requirements:
- hooks: exactly 5 viral hooks for TikTok/Reels openings (≤130 characters each). Punchy, emotional or curiosity-led.
- scripts: exactly 3 TikTok scripts. Each content MUST be speakable in max 30 seconds (~75 words or fewer). Hook fast; optional brief cues like [pause] or [on-screen text:] sparingly.
- caption: exactly 1 caption—high engagement, emotional resonance, MUST include relevant emojis (at least 2, tastefully placed).
- posts: exactly 5 distinct social posts (mix angles: story, tip, bold claim, soft CTA). Suitable for threads-style or short captions.

Language: mirror the user's topic language when obvious; otherwise English.`;

const USER_TOPIC_TEMPLATE = (topic: string) =>
  `Topic:\n${topic}\n\nReturn valid JSON matching the schema exactly.`;

export type GenerateTopicFailure = {
  ok: false;
  code: string;
  httpStatus: number;
  message: string;
};

export type GenerateTopicSuccess = { ok: true; output: ContentOutput };

export type GenerateTopicResult = GenerateTopicSuccess | GenerateTopicFailure;

function stripMarkdownFence(raw: string): string {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/u, "");
  }
  return t.trim();
}

function parseModelJson(raw: string): unknown {
  return JSON.parse(stripMarkdownFence(raw));
}

function extractValidOutput(raw: string): ContentOutput | null {
  try {
    const parsed = parseModelJson(raw);
    if (validateContentOutput(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function classifyOpenAIError(err: unknown): {
  httpStatus: number;
  message: string;
  code: string;
} {
  if (err instanceof OpenAI.APIError) {
    const status = err.status ?? 500;
    const message =
      status === 429
        ? "AI rate limit reached. Try again in a moment."
        : status === 401 || status === 403
          ? "AI credentials are invalid."
          : err.message || "AI request failed.";
    const code =
      status === 429 ? "RATE_LIMIT" : status === 401 ? "INVALID_KEY" : "OPENAI_ERROR";
    return { httpStatus: status >= 400 && status < 600 ? status : 502, message, code };
  }
  if (err instanceof Error && err.name === "AbortError") {
    return {
      httpStatus: 504,
      message: "Generation timed out. Try a shorter topic or retry.",
      code: "TIMEOUT",
    };
  }
  return {
    httpStatus: 500,
    message: err instanceof Error ? err.message : "Generation failed.",
    code: "UNKNOWN",
  };
}

async function chatJsonCompletion(
  openai: OpenAI,
  messages: ChatCompletionMessageParam[],
  temperature: number,
  signal?: AbortSignal
): Promise<{ raw: string } | GenerateTopicFailure> {
  try {
    const completion = await openai.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" },
        temperature,
        max_tokens: 3200,
      },
      { signal }
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw?.trim()) {
      return {
        ok: false,
        code: "EMPTY_RESPONSE",
        httpStatus: 502,
        message: "Empty response from AI.",
      };
    }
    return { raw };
  } catch (e) {
    const { httpStatus, message, code } = classifyOpenAIError(e);
    return { ok: false, code, httpStatus, message };
  }
}

/**
 * Calls OpenAI (gpt-4o-mini by default), returns validated structured JSON.
 * One repair round-trip if the first reply does not validate.
 */
export async function generateTopicContent(
  openai: OpenAI,
  topic: string,
  options?: { signal?: AbortSignal }
): Promise<GenerateTopicResult> {
  const signal = options?.signal;

  const initialMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: VIRAL_CONTENT_SYSTEM },
    { role: "user", content: USER_TOPIC_TEMPLATE(topic) },
  ];

  let round = await chatJsonCompletion(openai, initialMessages, 0.72, signal);
  if (!("raw" in round)) return round;

  let out = extractValidOutput(round.raw);
  if (out) return { ok: true, output: out };

  const repairMessages: ChatCompletionMessageParam[] = [
    ...initialMessages,
    { role: "assistant", content: stripMarkdownFence(round.raw).slice(0, 12000) },
    {
      role: "user",
      content:
        "Fix your reply: respond with ONLY one JSON object matching the schema exactly — 5 hooks, 3 scripts (title + content each), 1 caption with emojis, 5 posts. TikTok scripts ≤75 words each.",
    },
  ];

  round = await chatJsonCompletion(openai, repairMessages, 0.35, signal);
  if (!("raw" in round)) return round;

  out = extractValidOutput(round.raw);
  if (out) return { ok: true, output: out };

  return {
    ok: false,
    code: "INVALID_SHAPE",
    httpStatus: 502,
    message:
      "AI returned content that did not match the expected format. Try again or shorten your topic.",
  };
}

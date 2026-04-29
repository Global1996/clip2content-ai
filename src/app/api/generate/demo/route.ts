import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { generateTopicContent } from "@/lib/ai/topic-generation";
import {
  composeGenerationPrompt,
  parseGenerationOptionsFromBody,
} from "@/lib/dashboard/generation-meta";

export const DEMO_COOKIE = "virlo_demo_uses";
export const DEMO_MAX = 2;

const RAW_TOPIC_MAX_LEN = 500;
const COMPOSED_TOPIC_MAX_LEN = 12000;
const GENERATION_TIMEOUT_MS = Number(
  process.env.OPENAI_GENERATION_TIMEOUT_MS ?? 55_000
);

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(DEMO_COOKIE)?.value;
  const usedRaw = raw ? parseInt(raw, 10) : 0;
  const used =
    Number.isFinite(usedRaw) && usedRaw >= 0 ? Math.min(usedRaw, DEMO_MAX) : 0;
  return NextResponse.json({
    max: DEMO_MAX,
    used,
    remaining: Math.max(0, DEMO_MAX - used),
  });
}

export async function POST(request: Request) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const cookieStore = await cookies();
    const rawCount = cookieStore.get(DEMO_COOKIE)?.value;
    const prev = rawCount ? parseInt(rawCount, 10) : 0;
    const used =
      Number.isFinite(prev) && prev >= 0 ? Math.min(prev, DEMO_MAX) : 0;

    if (used >= DEMO_MAX) {
      return NextResponse.json(
        {
          error:
            "You've used your free live previews. Create a free account for more generations.",
          code: "DEMO_LIMIT",
          max: DEMO_MAX,
          used,
          remaining: 0,
        },
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body", code: "BAD_JSON" },
        { status: 400 }
      );
    }

    const topicRaw =
      typeof body === "object" &&
      body !== null &&
      "topic" in body &&
      typeof (body as { topic: unknown }).topic === "string"
        ? (body as { topic: string }).topic
        : "";

    const rawTrimmed = topicRaw.trim().slice(0, RAW_TOPIC_MAX_LEN);

    if (!rawTrimmed) {
      return NextResponse.json(
        { error: "Topic is required", code: "TOPIC_REQUIRED" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "AI is not configured (missing OPENAI_API_KEY)",
          code: "MISSING_OPENAI_KEY",
        },
        { status: 503 }
      );
    }

    const opts = parseGenerationOptionsFromBody(body);
    const composedTopic = composeGenerationPrompt(rawTrimmed, opts).slice(
      0,
      COMPOSED_TOPIC_MAX_LEN
    );

    const controller = new AbortController();
    timer = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

    const openai = new OpenAI({ apiKey });
    const result = await generateTopicContent(openai, composedTopic, {
      signal: controller.signal,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, code: result.code },
        { status: result.httpStatus }
      );
    }

    const output = result.output;
    const nextUsed = used + 1;
    const remaining = Math.max(0, DEMO_MAX - nextUsed);

    const res = NextResponse.json({
      topic: composedTopic,
      output,
      demo: true,
      max: DEMO_MAX,
      used: nextUsed,
      remaining,
    });

    res.cookies.set(DEMO_COOKIE, String(nextUsed), {
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Generation failed unexpectedly.",
        code: "INTERNAL",
      },
      { status: 500 }
    );
  } finally {
    if (timer) clearTimeout(timer);
  }
}

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { generateTopicContent } from "@/lib/ai/topic-generation";
import { gateGenerationForUser } from "@/lib/billing/entitlements";
import {
  composeGenerationPrompt,
  parseGenerationOptionsFromBody,
} from "@/lib/dashboard/generation-meta";

const RAW_TOPIC_MAX_LEN = 500;
const COMPOSED_TOPIC_MAX_LEN = 12000;
const GENERATION_TIMEOUT_MS = Number(
  process.env.OPENAI_GENERATION_TIMEOUT_MS ?? 55_000
);

export async function POST(request: Request) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
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

    const gate = await gateGenerationForUser(supabase, user.id);
    if (!gate.allowed) {
      return NextResponse.json(
        {
          error:
            "You've reached today's limit on the Free plan (3 generations per UTC day). Upgrade to Pro or Lifetime for unlimited generations.",
          code: "DAILY_LIMIT",
          usedToday: gate.usedToday,
          dailyLimit: gate.dailyLimit,
        },
        { status: 403 }
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

    const { data: row, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        topic: composedTopic,
        output,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(insertError);
      return NextResponse.json(
        { error: "Failed to save generation", code: "DB_INSERT" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: row?.id,
      topic: composedTopic,
      output,
    });
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

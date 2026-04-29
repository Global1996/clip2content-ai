import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ generationId: string }> };

/** Resolve whether this generation is already saved — powers toggle UI in generator/history. */
export async function GET(_request: Request, ctx: RouteContext) {
  const { generationId } = await ctx.params;
  if (!generationId?.trim()) {
    return NextResponse.json({ error: "Missing generation id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("source_generation_id", generationId.trim())
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  return NextResponse.json({
    favoriteId: data?.id != null ? String(data.id) : null,
  });
}

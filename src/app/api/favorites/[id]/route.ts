import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const increment_usage =
    typeof body === "object" &&
    body !== null &&
    "increment_usage" in body &&
    (body as { increment_usage?: unknown }).increment_usage === true;

  if (increment_usage) {
    const { data: cur } = await supabase
      .from("favorites")
      .select("usage_count")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    const next = ((cur?.usage_count as number) ?? 0) + 1;
    const { error } = await supabase
      .from("favorites")
      .update({ usage_count: next, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, usage_count: next });
  }

  return NextResponse.json({ error: "Unsupported patch" }, { status: 400 });
}

export async function DELETE(_request: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

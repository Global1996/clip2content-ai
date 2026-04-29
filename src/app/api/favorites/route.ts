import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateContentOutput } from "@/types/content";
import type { FavoriteContentType, FavoritesStatsPayload } from "@/types/favorites";

function startOfUtcMonthIso(): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") ?? "").trim().toLowerCase();
  const sort = (searchParams.get("sort") ?? "newest") as
    | "newest"
    | "oldest"
    | "most_used";
  const typeFilter = searchParams.get("type") ?? "";
  const platformFilter = searchParams.get("platform") ?? "";
  const tagsParam = searchParams.get("tags") ?? "";
  const tagFilters = tagsParam
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const { data: rows, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user.id)
    .limit(1000);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load favorites" }, { status: 500 });
  }

  const all = (rows ?? []) as Record<string, unknown>[];
  const startMonth = startOfUtcMonthIso();

  const tagUniverse = new Set<string>();
  for (const r of all) {
    const tags = (r.tags as string[]) ?? [];
    for (const t of tags) {
      const x = String(t).trim();
      if (x) tagUniverse.add(x);
    }
  }

  const stats: FavoritesStatsPayload = {
    total: all.length,
    thisMonth: all.filter(
      (r) => typeof r.created_at === "string" && r.created_at >= startMonth
    ).length,
    byType: {},
    byPlatform: {},
    availableTags: [...tagUniverse].sort((a, b) => a.localeCompare(b)),
  };

  for (const r of all) {
    const ct = String(r.content_type ?? "full_pack");
    const pf = String(r.platform ?? "tiktok");
    stats.byType[ct] = (stats.byType[ct] ?? 0) + 1;
    stats.byPlatform[pf] = (stats.byPlatform[pf] ?? 0) + 1;
  }

  const opened = all.filter((r) => Number(r.usage_count ?? 0) > 0);
  const recently_used = [...opened]
    .sort(
      (a, b) =>
        new Date(String(b.updated_at ?? b.created_at)).getTime() -
        new Date(String(a.updated_at ?? a.created_at)).getTime()
    )
    .slice(0, 5);
  const most_used = [...opened]
    .sort((a, b) => {
      const ud =
        Number(b.usage_count ?? 0) - Number(a.usage_count ?? 0);
      if (ud !== 0) return ud;
      return (
        new Date(String(b.updated_at ?? b.created_at)).getTime() -
        new Date(String(a.updated_at ?? a.created_at)).getTime()
      );
    })
    .slice(0, 5);

  let list = [...all];

  if (typeFilter && typeFilter !== "all") {
    list = list.filter((r) => String(r.content_type) === typeFilter);
  }
  if (platformFilter && platformFilter !== "all") {
    list = list.filter((r) => String(r.platform) === platformFilter);
  }

  if (search) {
    list = list.filter((r) => {
      const title = String(r.title ?? "").toLowerCase();
      const topic = String(r.topic_snapshot ?? "").toLowerCase();
      return title.includes(search) || topic.includes(search);
    });
  }

  if (tagFilters.length > 0) {
    list = list.filter((r) => {
      const tags = (r.tags as string[]) ?? [];
      const lowered = tags.map((t) => t.toLowerCase());
      return tagFilters.every((tf) => lowered.some((x) => x.includes(tf)));
    });
  }

  if (sort === "newest") {
    list.sort(
      (a, b) =>
        new Date(String(b.created_at)).getTime() -
        new Date(String(a.created_at)).getTime()
    );
  } else if (sort === "oldest") {
    list.sort(
      (a, b) =>
        new Date(String(a.created_at)).getTime() -
        new Date(String(b.created_at)).getTime()
    );
  } else {
    list.sort((a, b) => {
      const ua = Number(a.usage_count ?? 0);
      const ub = Number(b.usage_count ?? 0);
      if (ub !== ua) return ub - ua;
      return (
        new Date(String(b.created_at)).getTime() -
        new Date(String(a.created_at)).getTime()
      );
    });
  }

  return NextResponse.json({
    favorites: list,
    stats,
    recently_used,
    most_used,
  });
}

export async function POST(request: Request) {
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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim().slice(0, 500) : "";
  const topic_snapshot =
    typeof o.topic_snapshot === "string" ? o.topic_snapshot.slice(0, 12000) : null;
  const output = o.output;
  const content_type = (o.content_type as FavoriteContentType) ?? "full_pack";
  const platform = typeof o.platform === "string" ? o.platform.trim().slice(0, 32) : "tiktok";
  const tagsRaw = o.tags;
  const tags =
    Array.isArray(tagsRaw) && tagsRaw.every((x) => typeof x === "string")
      ? (tagsRaw as string[]).map((t) => t.trim()).filter(Boolean).slice(0, 20)
      : [];
  const source_generation_id =
    typeof o.source_generation_id === "string" ? o.source_generation_id : null;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!validateContentOutput(output)) {
    return NextResponse.json({ error: "Invalid output payload" }, { status: 400 });
  }

  const allowed: FavoriteContentType[] = [
    "hook",
    "caption",
    "script",
    "idea",
    "full_pack",
  ];
  const ct = allowed.includes(content_type) ? content_type : "full_pack";

  const insertPayload = {
    user_id: user.id,
    title,
    topic_snapshot,
    output,
    content_type: ct,
    platform,
    tags,
    source_generation_id,
  };

  const { data: row, error } = await supabase
    .from("favorites")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Already saved from this generation", code: "DUPLICATE" },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to save favorite" }, { status: 500 });
  }

  return NextResponse.json({ id: row?.id, ok: true });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildUsagePayload } from "@/lib/dashboard/user-dashboard";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const usage = await buildUsagePayload(supabase, user.id);
    return NextResponse.json(usage);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load usage" }, { status: 500 });
  }
}

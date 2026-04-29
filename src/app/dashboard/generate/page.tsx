import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { needsOnboarding } from "@/lib/dashboard/onboarding";
import { GenerationWorkspace } from "@/components/dashboard/generation-workspace";

export default async function DashboardGeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ seed_topic?: string; seed_platform?: string }>;
}) {
  const sp = await searchParams;
  const seed_topic =
    typeof sp.seed_topic === "string" ? sp.seed_topic : undefined;
  const seed_platform =
    typeof sp.seed_platform === "string" ? sp.seed_platform : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/generate");
  }

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (await needsOnboarding(supabase, user.id, meta)) {
    redirect("/dashboard/onboarding");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-20 lg:space-y-12 lg:pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Generate Content
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-zinc-400">
          Tune tone and platform, then ship hooks, scripts, captions, and posts.
        </p>
      </div>
      <GenerationWorkspace
        heading={undefined}
        showHeading={false}
        initialTopicSeed={seed_topic}
        initialPlatformSeed={seed_platform}
      />
    </div>
  );
}

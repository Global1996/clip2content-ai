import { notFound } from "next/navigation";
import {
  DASHBOARD_TOOLS,
  isDashboardToolSlug,
} from "@/lib/dashboard/dashboard-tools-config";
import { GenerationWorkspace } from "@/components/dashboard/generation-workspace";

export default async function DashboardToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  if (!isDashboardToolSlug(tool)) notFound();

  const cfg = DASHBOARD_TOOLS[tool];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 pb-20 lg:gap-12 lg:pb-24">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Tools
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {cfg.title}
        </h1>
        <p className="max-w-prose text-[15px] leading-relaxed text-zinc-400">
          {cfg.description}
        </p>
      </header>

      <GenerationWorkspace
        emphasis={cfg.emphasis}
        submitLabel={`Generate · ${cfg.shortTitle}`}
        showHeading={false}
      />
    </div>
  );
}

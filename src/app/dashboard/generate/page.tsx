import { GenerationWorkspace } from "@/components/dashboard/generation-workspace";

export default function DashboardGeneratePage() {
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
      <GenerationWorkspace heading={undefined} showHeading={false} />
    </div>
  );
}

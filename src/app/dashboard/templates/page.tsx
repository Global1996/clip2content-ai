import Link from "next/link";

export default function DashboardTemplatesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16 lg:pb-20">
      <div className="space-y-2">
        <span className="inline-flex rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          New
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Templates
        </h1>
        <p className="text-[15px] leading-relaxed text-zinc-400">
          Saved prompts and layouts are coming soon. For now, generate from the dashboard home or{" "}
          <Link
            href="/dashboard/generate"
            className="font-semibold text-violet-400 underline-offset-4 hover:underline"
          >
            Generate Content
          </Link>
          .
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#111827]/40 px-8 py-14 text-center text-sm text-zinc-500">
        No templates yet — check back shortly.
      </div>
    </div>
  );
}

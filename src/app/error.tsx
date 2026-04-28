"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="text-lg font-semibold text-foreground">Something went wrong</p>
      <p className="max-w-md text-sm text-muted">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again or refresh the page."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
      >
        Try again
      </button>
    </div>
  );
}

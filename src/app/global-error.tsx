"use client";

/** Root-level fallback when the root layout fails (must include html/body). */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#08090e] px-6 py-16 text-center text-white antialiased">
        <p className="text-lg font-semibold">Virlo couldn&apos;t load</p>
        <p className="max-w-md text-sm text-white/65">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "Please try again."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-2xl bg-[#5b8cff] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Try again
        </button>
      </body>
    </html>
  );
}

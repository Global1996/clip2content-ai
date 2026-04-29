import { cn } from "@/lib/utils";

type Props = { platform: string; className?: string };

/** Compact SVG marks for major platforms (not official logos — recognizable glyphs). */
export function FavoritePlatformIcon({ platform, className }: Props) {
  const p = platform.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-black/25 text-white shadow-inner",
        className
      )}
      aria-hidden
    >
      {p === "instagram" ? (
        <IgGlyph />
      ) : p === "youtube" ? (
        <YtGlyph />
      ) : p === "linkedin" ? (
        <LiGlyph />
      ) : p === "x" ? (
        <XGlyph />
      ) : p === "tiktok" ? (
        <TtGlyph />
      ) : (
        <span className="text-lg">✨</span>
      )}
    </span>
  );
}

function TtGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M17.6 4.5v2.26a8.45 8.45 0 0 1-4.92-1.42v9.66c0 4.23-3.43 7.66-7.66 7.66S0 18.23 0 14 3.43 6.34 7.66 6.34c.87 0 1.7.14 2.48.4v3.1a4.64 4.64 0 0 0-2.48-.72 4.58 4.58 0 1 0 4.58 4.58V4.5h3.14c.07.76.23 1.48.48 2.14a5.48 5.48 0 0 0 3.26 2.92z" />
    </svg>
  );
}

function IgGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <defs>
        <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="50%" stopColor="#e6683c" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="url(#ig)"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4.2" stroke="url(#ig)" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.3" fill="url(#ig)" />
    </svg>
  );
}

function YtGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#ff0033"
        d="M21.6 7.2c-.2-1-.95-1.75-1.95-1.95C17.9 4.8 12 4.8 12 4.8s-5.9 0-7.65.45c-1 .2-1.75.95-1.95 1.95C2 9 2 12 2 12s0 3 .4 4.8c.2 1 .95 1.75 1.95 1.95 1.75.45 7.65.45 7.65.45s5.9 0 7.65-.45c1-.2 1.75-.95 1.95-1.95.4-1.8.4-4.8.4-4.8s0-3-.4-4.8z"
      />
      <path fill="#fff" d="M10 15V9l6 3-6 3z" />
    </svg>
  );
}

function LiGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#0A66C2">
      <path d="M6.5 8.7h-4V22h4V8.7zm-2-6.3c-1.3 0-2.4 1.1-2.4 2.4 0 1.3 1.1 2.4 2.4 2.4s2.4-1.1 2.4-2.4C8.9 3.5 7.8 2.4 6.5 2.4zm15.5 6c-2.7 0-4.5 1.5-5.2 2.9h-.1V8.7H10V22h4v-7.4c0-1.9.4-3.7 2.7-3.7 2.4 0 2.3 2 2.3 4.5V22h4v-8.8c0-4.4-.9-7.8-6.5-7.8z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M18.24 3h3.43l-7.48 8.55L22 21h-6.52l-5.1-6.67L5.66 21H2.2l8.02-9.15L2 3h6.68l4.6 6.05L18.24 3zm-1.2 16.17h1.9L7.9 4.78H5.87l11.17 14.39z" />
    </svg>
  );
}

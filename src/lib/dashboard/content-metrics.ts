import type { ContentOutput } from "@/types/content";

/** Discrete pieces users care about (hooks + scripts + caption + posts). */
export function countContentPieces(output: ContentOutput): number {
  return (
    output.hooks.length +
    output.scripts.length +
    1 +
    output.posts.length
  );
}

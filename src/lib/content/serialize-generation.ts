import type { ContentOutput } from "@/types/content";

/** Plain-text export for clipboard / downloads. */
export function serializeGenerationPlainText(topic: string, output: ContentOutput): string {
  const lines: string[] = [];
  lines.push(`TOPIC`, topic, "");
  lines.push(`HOOKS`);
  output.hooks.forEach((h, i) => lines.push(`${i + 1}. ${h}`));
  lines.push("");
  lines.push(`TIKTOK SCRIPTS`);
  output.scripts.forEach((s, i) => {
    lines.push(`— Script ${i + 1}: ${s.title}`, s.content, "");
  });
  lines.push(`CAPTION`);
  lines.push(output.caption);
  lines.push("");
  lines.push(`SOCIAL POSTS`);
  output.posts.forEach((p, i) => lines.push(`${i + 1}. ${p}`, ""));
  return lines.join("\n").trim();
}

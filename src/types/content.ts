export type GeneratedScript = {
  title: string;
  content: string;
};

export type ContentOutput = {
  hooks: string[];
  scripts: GeneratedScript[];
  caption: string;
  posts: string[];
};

export function validateContentOutput(data: unknown): data is ContentOutput {
  if (!data || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.hooks) || o.hooks.length !== 5) return false;
  if (!o.hooks.every((h) => typeof h === "string")) return false;
  if (!Array.isArray(o.scripts) || o.scripts.length !== 3) return false;
  for (const s of o.scripts) {
    if (!s || typeof s !== "object") return false;
    const sc = s as Record<string, unknown>;
    if (typeof sc.title !== "string" || typeof sc.content !== "string") return false;
  }
  if (typeof o.caption !== "string") return false;
  if (!Array.isArray(o.posts) || o.posts.length !== 5) return false;
  if (!o.posts.every((p) => typeof p === "string")) return false;
  return true;
}

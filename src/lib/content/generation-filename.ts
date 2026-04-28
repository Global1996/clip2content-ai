/** Safe ASCII-ish slug for download filenames. */
export function generationDownloadBasename(topic: string): string {
  const trimmed = topic.trim().slice(0, 80);
  const slug = trimmed
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "virlo-pack";
}

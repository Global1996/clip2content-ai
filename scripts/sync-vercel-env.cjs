/**
 * Push env vars to Vercel (production + preview) using the REST API + your CLI login token.
 * Run from repo root: `node scripts/sync-vercel-env.cjs`
 *
 * Does not print secret values — only key names.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ENV_LOCAL = path.join(ROOT, ".env.local");
const PROJECT_JSON = path.join(ROOT, ".vercel", "project.json");

const CANONICAL_APP_URL =
  process.env.VERCEL_CANONICAL_URL?.replace(/\/$/, "") ||
  "https://clip2content-ai.vercel.app";

const ENV_ORDER = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "OPENAI_GENERATION_TIMEOUT_MS",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_PRO_MONTHLY",
  "STRIPE_PRICE_LIFETIME",
];

function parseDotEnv(content) {
  const out = {};
  for (let line of content.split(/\r?\n/)) {
    line = line.trimEnd();
    const trimmed = line.trimStart();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function isPlaceholder(key, val) {
  if (val === undefined || val === null) return true;
  const v = String(val).trim();
  if (!v) return true;
  if (/^your_/i.test(v)) return true;
  if (/^sk-your-key$/i.test(v)) return true;
  if (/^sk_live_or_test/i.test(v)) return true;
  if (/^price_\.\.\.$/i.test(v)) return true;
  if (/^whsec_\.\.\.$/i.test(v)) return true;
  return false;
}

function loadToken() {
  const envTok = process.env.VERCEL_TOKEN?.trim();
  if (envTok) return envTok;

  const candidates = [
    path.join(process.env.APPDATA || "", "com.vercel.cli", "Data", "auth.json"),
    path.join(process.env.USERPROFILE || "", ".local", "share", "com.vercel.cli", "auth.json"),
  ];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    try {
      const raw = JSON.parse(fs.readFileSync(file, "utf8"));
      const t =
        raw.token ||
        raw.credentials?.token ||
        (Array.isArray(raw.credentials) ? raw.credentials[0]?.token : null);
      if (typeof t === "string" && t.length > 8) return t;
    } catch {
      continue;
    }
  }

  throw new Error(
    "Could not load Vercel token. Run `vercel login` or set VERCEL_TOKEN."
  );
}

async function vercelFetch(token, pathname, teamId, opts = {}) {
  let pathWithTeam = pathname;
  if (teamId) {
    const sep = pathname.includes("?") ? "&" : "?";
    pathWithTeam = `${pathname}${sep}teamId=${encodeURIComponent(teamId)}`;
  }
  const url = `https://api.vercel.com${pathWithTeam}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg =
      typeof json === "object" && json?.error?.message
        ? json.error.message
        : text.slice(0, 600);
    throw new Error(`Vercel API ${pathname}: HTTP ${res.status} ${msg}`);
  }
  return json;
}

async function listProjectEnvs(token, projectId, teamId) {
  const data = await vercelFetch(token, `/v9/projects/${projectId}/env`, teamId);
  return Array.isArray(data.envs) ? data.envs : [];
}

async function deleteEnv(token, projectId, teamId, envId) {
  await vercelFetch(token, `/v9/projects/${projectId}/env/${envId}`, teamId, {
    method: "DELETE",
  });
}

async function createEnv(token, projectId, teamId, key, value, targets) {
  await vercelFetch(token, `/v10/projects/${projectId}/env`, teamId, {
    method: "POST",
    body: JSON.stringify({
      key,
      value,
      type: "encrypted",
      target: targets,
      comment: "",
    }),
  });
}

async function upsertEnv(token, projectId, teamId, key, value, targets) {
  const existing = await listProjectEnvs(token, projectId, teamId);
  const ids = existing.filter((e) => e.key === key).map((e) => e.id);
  for (const id of ids) {
    await deleteEnv(token, projectId, teamId, id);
  }
  await createEnv(token, projectId, teamId, key, value, targets);
}

async function main() {
  if (!fs.existsSync(PROJECT_JSON)) {
    console.error("Missing .vercel/project.json — run `npx vercel link` first.");
    process.exit(1);
  }

  if (!fs.existsSync(ENV_LOCAL)) {
    console.error("Missing .env.local — copy from .env.example and fill secrets.");
    process.exit(1);
  }

  const { projectId, orgId: teamId } = JSON.parse(
    fs.readFileSync(PROJECT_JSON, "utf8")
  );
  const token = loadToken();

  const parsed = parseDotEnv(fs.readFileSync(ENV_LOCAL, "utf8"));
  const merged = {
    ...parsed,
    NEXT_PUBLIC_APP_URL: CANONICAL_APP_URL,
  };

  const targets = ["production", "preview"];
  const skipped = [];
  const pushed = [];

  for (const key of ENV_ORDER) {
    const val = merged[key];
    if (val === undefined) {
      skipped.push(`${key} (missing)`);
      continue;
    }
    if (isPlaceholder(key, val)) {
      skipped.push(`${key} (placeholder)`);
      continue;
    }

    await upsertEnv(token, projectId, teamId, key, String(val), targets);
    pushed.push(key);
    console.log(`OK ${key}`);
  }

  console.log("\nSynced on Vercel (production + preview):", pushed.join(", ") || "(none)");
  if (skipped.length) {
    console.log("\nSkipped — set in Supabase/Stripe/OpenAI then re-run or add in Vercel UI:");
    skipped.forEach((s) => console.log(` - ${s}`));
  }

  console.log(
    "\nRedeploy so the build picks up NEXT_PUBLIC_* and other env: Vercel → Deployments → Redeploy, or run `npx vercel deploy --prod --yes`."
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

/**
 * Pushes critical NEXT_PUBLIC_* vars from .env.local to Vercel using CLI --value (works on Windows).
 * Run: node scripts/push-critical-env-vercel.cjs
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const ENV_LOCAL = path.join(ROOT, ".env.local");
const vercelCli = path.join(ROOT, "node_modules", "vercel", "dist", "vc.js");

const CANONICAL_APP_URL =
  process.env.VERCEL_CANONICAL_URL?.replace(/\/$/, "") ||
  "https://clip2content-ai.vercel.app";

const KEYS_TO_PUSH = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
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

function runEnvAdd(key, value, envName) {
  const args = [
    vercelCli,
    "env",
    "add",
    key,
    envName,
    "--value",
    value,
    "--yes",
    "--force",
    "--no-sensitive",
  ];
  const r = spawnSync(process.execPath, args, {
    cwd: ROOT,
    shell: false,
    encoding: "utf-8",
    maxBuffer: 30 * 1024 * 1024,
  });
  if (r.status !== 0) {
    console.error(r.stderr);
    console.error(r.stdout);
    console.error(r.error);
    throw new Error(
      `[env add ${key} ${envName}] ${r.stderr || r.stdout || r.error || "failed"}`
    );
  }
}

function main() {
  if (!fs.existsSync(ENV_LOCAL)) {
    console.error("Missing .env.local");
    process.exit(1);
  }

  const parsed = parseDotEnv(fs.readFileSync(ENV_LOCAL, "utf8"));
  const merged = {
    ...parsed,
    NEXT_PUBLIC_APP_URL: CANONICAL_APP_URL,
  };

  /** Preview requires git branch when repo-linked; production fixes live site immediately. */
  const environments = ["production"];

  for (const key of KEYS_TO_PUSH) {
    const val = merged[key]?.trim();
    if (!val) {
      console.error(`Skip ${key}: missing or empty`);
      continue;
    }
    if (
      key.includes("SUPABASE") &&
      (val.includes("YOUR_PROJECT") || val === "your_anon_key")
    ) {
      console.error(`Skip ${key}: placeholder`);
      continue;
    }

    for (const envName of environments) {
      runEnvAdd(key, val, envName);
      console.log(`OK ${key} → ${envName}`);
    }
  }

  console.log("\nDone. Deploy with: npx vercel deploy --prod --yes");
}

main();

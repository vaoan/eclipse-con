#!/usr/bin/env node
/**
 * Uploads the fco-links Worker secrets with `wrangler secret bulk`.
 *
 *   pnpm links:secrets
 *
 * VISITOR_HASH_KEY            from .secrets (GitHub secret, synced). If it is
 *                             missing everywhere, one is generated into
 *                             .env.local — then store it as the GitHub secret
 *                             (changing it only resets today's uniques)
 * GOOGLE_SERVICE_ACCOUNT_JSON from .secrets / .env.local (optional until the
 *                             Google side exists)
 *
 * Values travel through a temp file that is deleted right after; nothing is
 * printed.
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { appendFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { APP, ROOT, loadEnv, requireValue } from "./env.mjs";

const env = loadEnv();
requireValue(env, "CLOUDFLARE_API_TOKEN", "Run `pnpm sync:secrets` first.");

let hashKey = env.VISITOR_HASH_KEY;
if (!hashKey) {
  hashKey = randomBytes(32).toString("hex");
  appendFileSync(
    resolve(ROOT, ".env.local"),
    `\nVISITOR_HASH_KEY=${hashKey}\n`
  );
  console.log("generated VISITOR_HASH_KEY into .env.local");
}

const secrets = { VISITOR_HASH_KEY: hashKey };
if (env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  // Compact to one line; also validates it is JSON.
  secrets.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify(
    JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON)
  );
} else {
  console.log(
    "GOOGLE_SERVICE_ACCOUNT_JSON not set yet — skipped (sync stays 'not configured')."
  );
}

const directory = mkdtempSync(join(tmpdir(), "fco-links-"));
const file = join(directory, "secrets.json");
try {
  writeFileSync(file, JSON.stringify(secrets), { mode: 0o600 });
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "wrangler",
      "secret",
      "bulk",
      file,
      "--config",
      join(APP, "wrangler.toml"),
    ],
    {
      cwd: ROOT,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, CLOUDFLARE_API_TOKEN: env.CLOUDFLARE_API_TOKEN },
    }
  );
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(directory, { recursive: true, force: true });
}

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const envLocalPath = resolve(process.cwd(), ".env.local");

if (existsSync(envLocalPath)) {
  for (const line of readFileSync(envLocalPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

const wranglerEntry = resolve(
  process.cwd(),
  "node_modules",
  "wrangler",
  "bin",
  "wrangler.js"
);

const args = process.argv.slice(2);
const hasExplicitEnv = args.some(
  (arg, index) =>
    arg === "--env" ||
    arg === "-e" ||
    arg.startsWith("--env=") ||
    (index > 0 && (args[index - 1] === "--env" || args[index - 1] === "-e"))
);
const result = spawnSync(
  process.execPath,
  [wranglerEntry, "deploy", ...(hasExplicitEnv ? [] : ["--env="]), ...args],
  {
    stdio: "inherit",
    env: process.env,
    shell: false,
  }
);

if (result.error) {
  console.error(
    `[deploy-cloudflare] Failed to spawn wrangler: ${result.error.message}`
  );
  process.exit(1);
}

process.exit(result.status ?? 1);

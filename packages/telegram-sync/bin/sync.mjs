#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resolvePythonCommand } from "./resolve-python.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, "..", "src");

/** Parse `--flag value` pairs and a positional subcommand from argv. */
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[++i];
    else args._.push(argv[i]);
  }
  return args;
}

/** Load KEY=VALUE pairs from an env file into an object (ignores comments). */
function readEnvFile(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    out[t.slice(0, i).trim()] = t
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return out;
}

/** Find the repo root by walking up to the dir containing pnpm-workspace.yaml. */
function repoRoot(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) return dir;
    dir = resolve(dir, "..");
  }
  return start;
}

const args = parseArgs(process.argv.slice(2));
const command = args._[0] ?? "sync";
if (!args.config) {
  console.error(
    "Usage: telegram-sync <sync|list|remove> --config <path> [--id <n>]"
  );
  process.exit(1);
}

const configPath = resolve(process.cwd(), args.config);
const appDir = dirname(configPath);
const config = JSON.parse(readFileSync(configPath, "utf8"));
const outDir = resolve(appDir, config.outDir ?? "public/telegram");
const root = repoRoot(appDir);
const secrets = readEnvFile(resolve(root, ".env.local"));

const env = {
  ...process.env,
  ...secrets,
  TELEGRAM_TARGET: config.target ?? "",
  TELEGRAM_THREAD_ID: config.threadId != null ? String(config.threadId) : "",
  TELEGRAM_SINCE: config.since ?? "",
  TELEGRAM_OUT_DIR: outDir,
  TELEGRAM_SESSION: resolve(root, ".telegram.session"),
  TELEGRAM_SELECT: JSON.stringify(config.select ?? {}),
  TRANSLATE_TO: config.translateTo ?? "en",
};

const python = resolvePythonCommand();
if (!python) {
  console.error(
    "No suitable Python interpreter found. Install Python 3.10+ (see README)."
  );
  process.exit(1);
}

const ENTRY = {
  sync: "fetch.py",
  list: "list_cli.py",
  remove: "remove_cli.py",
};
function runPy(script, extra = []) {
  const r = spawnSync(python, [resolve(SRC, script), ...extra], {
    stdio: "inherit",
    env,
  });
  return r.status ?? 1;
}

if (command === "sync") {
  const code = runPy("fetch.py");
  process.exit(code === 0 ? runPy("translate.py") : code);
} else if (command === "list") {
  process.exit(runPy("list_cli.py"));
} else if (command === "remove") {
  if (!args.id) {
    console.error("remove requires --id <n>");
    process.exit(1);
  }
  process.exit(runPy("remove_cli.py", [args.id]));
} else if (command === "fetch") {
  process.exit(runPy("fetch.py"));
} else if (command === "translate") {
  process.exit(runPy("translate.py"));
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

/**
 * Shared helpers for the fco-links ops scripts: load secrets from the repo's
 * `.secrets` (synced from GitHub) and `.env.local` (local overrides), and call
 * the Cloudflare API. Never print a secret value.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Repository root. */
export const ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../.."
);
/** The links app directory. */
export const APP = resolve(ROOT, "apps/links");

/** Parse KEY=VALUE lines (values may contain "="; surrounding quotes dropped). */
function parseEnvFile(path) {
  const values = {};
  if (!existsSync(path)) {
    return values;
  }
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (match) {
      values[match[1]] = match[2].trim().replace(/^(["'])(.*)\1$/, "$2");
    }
  }
  return values;
}

/**
 * Secrets and settings: `.secrets`, overridden by `.env.local`, overridden by
 * the process environment.
 */
export function loadEnv() {
  return {
    ...parseEnvFile(resolve(ROOT, ".secrets")),
    ...parseEnvFile(resolve(ROOT, ".env.local")),
    ...Object.fromEntries(
      Object.entries(process.env).filter(([key]) => /^[A-Z0-9_]+$/.test(key))
    ),
  };
}

/** Exit with a message (no stack) when a required value is missing. */
export function requireValue(env, key, hint) {
  const value = env[key];
  if (!value) {
    console.error(`Missing ${key}. ${hint}`);
    process.exit(1);
  }
  return value;
}

/**
 * A Cloudflare API caller bound to a token. Throws with the API's error
 * messages (never the token) on failure.
 */
export function cloudflare(token) {
  return async function call(method, path, body) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/${path}`,
      {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }
    );
    const json = await response.json();
    if (!json.success) {
      const messages = (json.errors ?? []).map(
        (error) => `${error.code}: ${error.message}`
      );
      throw new Error(`${method} ${path} failed — ${messages.join("; ")}`);
    }
    return json.result;
  };
}

/** The `vars` value of a key in apps/links/wrangler.toml ("" when unset). */
export function wranglerVar(key) {
  const toml = readFileSync(resolve(APP, "wrangler.toml"), "utf8");
  const match = new RegExp(`^${key}\\s*=\\s*"([^"]*)"`, "m").exec(toml);
  return match ? match[1] : "";
}

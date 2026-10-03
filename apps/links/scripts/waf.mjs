#!/usr/bin/env node
/**
 * Upserts the fco.bz firewall rule that blocks vulnerability-scanner probes
 * before they reach the Worker: blocked requests cost no Worker request and no
 * D1 write.
 *
 *   pnpm links:waf
 *
 * Blocks, on host fco.bz only:
 * - any path containing "." (slugs never do), except /favicon.ico
 * - the reserved scanner words in worker/slug.ts (RESERVED_SLUGS), as /word
 *   or /word/...
 *
 * Free plan: custom rules cannot use regex, so the expression is built from
 * `contains`, `starts_with` and `in`. Other rules in the zone are preserved;
 * ours is matched by its description. Never prints the token.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { APP, cloudflare, loadEnv, requireValue } from "./env.mjs";

const ZONE_NAME = "fco.bz";
const DESCRIPTION = "fco-links: block scanner probes (pnpm links:waf)";
const PHASE = "http_request_firewall_custom";

/** RESERVED_SLUGS, read from the Worker source so the list lives in one place. */
function reservedSlugs() {
  const source = readFileSync(resolve(APP, "worker/slug.ts"), "utf8");
  const block = /RESERVED_SLUGS[^=]*=\s*\[([\s\S]*?)\]/.exec(source);
  if (!block) {
    throw new Error("RESERVED_SLUGS not found in worker/slug.ts");
  }
  return [...block[1].matchAll(/"([a-z0-9-]+)"/g)].map((match) => match[1]);
}

const words = reservedSlugs();
const exact = words.map((word) => `"/${word}"`).join(" ");
const prefixes = words
  .map((word) => `starts_with(lower(http.request.uri.path), "/${word}/")`)
  .join(" or ");
const expression = [
  `(http.host eq "${ZONE_NAME}")`,
  "and (",
  `(http.request.uri.path contains "." and http.request.uri.path ne "/favicon.ico")`,
  `or lower(http.request.uri.path) in {${exact}}`,
  `or ${prefixes}`,
  ")",
].join(" ");

const env = loadEnv();
const api = cloudflare(
  requireValue(env, "CLOUDFLARE_API_TOKEN", "Run `pnpm sync:secrets` first.")
);

const [zone] = await api("GET", `zones?name=${ZONE_NAME}`);
if (!zone) {
  console.error(`Zone ${ZONE_NAME} not found for this token.`);
  process.exit(1);
}

let existing = [];
try {
  const entry = await api(
    "GET",
    `zones/${zone.id}/rulesets/phases/${PHASE}/entrypoint`
  );
  existing = entry.rules ?? [];
} catch {
  // No entrypoint yet: the PUT below creates it.
}

const ours = { description: DESCRIPTION, expression, action: "block" };
const others = existing
  .filter((rule) => rule.description !== DESCRIPTION)
  .map(({ id, description, expression: expr, action, enabled }) => ({
    id,
    description,
    expression: expr,
    action,
    enabled,
  }));
await api("PUT", `zones/${zone.id}/rulesets/phases/${PHASE}/entrypoint`, {
  rules: [...others, ours],
});
console.log(
  `${existing.some((rule) => rule.description === DESCRIPTION) ? "updated" : "created"} WAF rule on ${ZONE_NAME}: ${words.length} reserved words + dotted paths blocked`
);

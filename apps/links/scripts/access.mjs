#!/usr/bin/env node
/**
 * Idempotent Cloudflare Zero Trust setup for admin.fco.bz.
 *
 *   pnpm links:access                  # group, policy, Google IdP, app
 *   pnpm links:access --service-token  # also a service token for /api/export.csv
 *
 * Reads (never prints) from .secrets / .env.local:
 *   CLOUDFLARE_API_TOKEN            needs Access: Apps/Policies + Orgs/IdPs/Groups Edit
 *   LINKS_ADMIN_EMAILS              comma-separated allow-list (kept out of git)
 *   GOOGLE_OAUTH_CLIENT_ID/SECRET   optional; adds "Sign in with Google"
 *
 * Creates or updates: the Google login method (when configured), the group
 * "fco.bz admins", a reusable allow policy for it, and the self-hosted app
 * "fco.bz admin" on admin.fco.bz (24 h session, email code + Google). Then
 * writes the app's AUD tag into apps/links/wrangler.toml (ACCESS_AUD — an
 * identifier, not a secret) so the Worker can verify Access JWTs.
 *
 * To add someone: update LINKS_ADMIN_EMAILS (GitHub secret → pnpm
 * sync:secrets, or .env.local) and run this again.
 */
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { APP, ROOT, cloudflare, loadEnv, requireValue } from "./env.mjs";

const APP_DOMAIN = "admin.fco.bz";
const APP_NAME = "fco.bz admin";
const GROUP_NAME = "fco.bz admins";
const POLICY_NAME = "fco.bz admins — allow";
const SERVICE_TOKEN_NAME = "fco-links export";
const SERVICE_POLICY_NAME = "fco.bz export — service token";
const SESSION = "24h";

const env = loadEnv();
const api = cloudflare(
  requireValue(env, "CLOUDFLARE_API_TOKEN", "Run `pnpm sync:secrets` first.")
);
const emails = requireValue(
  env,
  "LINKS_ADMIN_EMAILS",
  "Set it (comma-separated) in .env.local or as a GitHub secret."
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const wantServiceToken = process.argv.includes("--service-token");

/** Create or update a named object in an Access collection. */
async function upsert(collection, match, body) {
  const existing = (await api("GET", collection)).find(match);
  if (existing) {
    const updated = await api("PUT", `${collection}/${existing.id}`, body);
    console.log(`updated ${collection.split("/").pop()}: ${body.name}`);
    return updated;
  }
  const created = await api("POST", collection, body);
  console.log(`created ${collection.split("/").pop()}: ${body.name}`);
  return created;
}

const accountId =
  env.CLOUDFLARE_ACCOUNT_ID || (await api("GET", "accounts"))[0].id;
const base = `accounts/${accountId}/access`;

// Login methods: the existing one-time PIN, plus Google when configured.
const idps = await api("GET", `${base}/identity_providers`);
const otp = idps.find((idp) => idp.type === "onetimepin");
if (!otp) {
  throw new Error("No One-time PIN login method found in the Zero Trust org.");
}
let google = null;
if (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET) {
  google = await upsert(
    `${base}/identity_providers`,
    (idp) => idp.type === "google",
    {
      name: "Google",
      type: "google",
      config: {
        client_id: env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      },
    }
  );
} else {
  console.log("Google sign-in skipped: GOOGLE_OAUTH_CLIENT_ID/SECRET not set.");
}

const group = await upsert(
  `${base}/groups`,
  (item) => item.name === GROUP_NAME,
  {
    name: GROUP_NAME,
    include: emails.map((email) => ({ email: { email } })),
  }
);
console.log(`  ${emails.length} email(s) allowed`);

const policy = await upsert(
  `${base}/policies`,
  (item) => item.name === POLICY_NAME,
  {
    name: POLICY_NAME,
    decision: "allow",
    include: [{ group: { id: group.id } }],
    session_duration: SESSION,
  }
);

const policies = [{ id: policy.id, precedence: 1 }];
if (wantServiceToken) {
  const tokens = await api("GET", `${base}/service_tokens`);
  let token = tokens.find((item) => item.name === SERVICE_TOKEN_NAME);
  if (!token) {
    token = await api("POST", `${base}/service_tokens`, {
      name: SERVICE_TOKEN_NAME,
      duration: "8760h",
    });
    // The secret is only returned now: store it locally, never print it.
    appendFileSync(
      resolve(ROOT, ".env.local"),
      `\nLINKS_EXPORT_CLIENT_ID=${token.client_id}\nLINKS_EXPORT_CLIENT_SECRET=${token.client_secret}\n`
    );
    console.log(
      "created service token; its id and secret were saved to .env.local"
    );
  }
  const servicePolicy = await upsert(
    `${base}/policies`,
    (item) => item.name === SERVICE_POLICY_NAME,
    {
      name: SERVICE_POLICY_NAME,
      decision: "non_identity",
      include: [{ service_token: { token_id: token.id } }],
    }
  );
  policies.push({ id: servicePolicy.id, precedence: 2 });
}

const app = await upsert(`${base}/apps`, (item) => item.domain === APP_DOMAIN, {
  name: APP_NAME,
  domain: APP_DOMAIN,
  type: "self_hosted",
  session_duration: SESSION,
  allowed_idps: [otp.id, ...(google ? [google.id] : [])],
  auto_redirect_to_identity: false,
  app_launcher_visible: true,
  policies,
});

const tomlPath = resolve(APP, "wrangler.toml");
const toml = readFileSync(tomlPath, "utf8");
const next = toml.replace(/^ACCESS_AUD = ".*"$/m, `ACCESS_AUD = "${app.aud}"`);
if (next === toml) {
  console.log(`ACCESS_AUD already ${app.aud}`);
} else {
  writeFileSync(tomlPath, next);
  console.log(
    `wrote ACCESS_AUD = "${app.aud}" to apps/links/wrangler.toml — commit it and deploy.`
  );
}

/**
 * Bindings, vars and secrets the fco-links Worker reads (see wrangler.toml).
 * Optional members may legitimately be missing; every reader handles that.
 */
export interface Env {
  /** D1 database `fco-links`. */
  readonly DB: D1Database;
  /** Dashboard SPA (static assets). */
  readonly ASSETS: Fetcher;
  /** Zero Trust team domain, e.g. `furrycolombia.cloudflareaccess.com`. */
  readonly ACCESS_TEAM?: string;
  /** AUD tag of the "fco.bz admin" Access application. */
  readonly ACCESS_AUD?: string;
  /** Google Sheet ID holding the links. */
  readonly LINKS_SHEET_ID?: string;
  /** Secret: HMAC key for the daily visitor hash. */
  readonly VISITOR_HASH_KEY?: string;
  /** Secret: Google service-account key JSON (one line). */
  readonly GOOGLE_SERVICE_ACCOUNT_JSON?: string;
  /** Local dev only: identity used when the request comes from localhost. */
  readonly DEV_ACCESS_EMAIL?: string;
  /** Optional R2 bucket for the weekly raw-clicks export. */
  readonly BACKUP_BUCKET?: R2Bucket;
}

/** Where every non-link request on fco.bz (and inactive links) lands. */
export const FALLBACK_URL = "https://furrycolombia.com/";

/** The dashboard host; every other host is treated as the short-link host. */
export const ADMIN_HOST = "admin.fco.bz";

import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import type { Env } from "./env";

/** Who is calling the API, as asserted by Cloudflare Access. */
export interface AccessIdentity {
  /** Signed-in person's email (user logins). */
  readonly email: string | null;
  /** Service-token client id (`common_name`) for machine callers. */
  readonly serviceToken: string | null;
}

/** Inputs to {@link verifyAccessJwt}. */
export interface VerifyOptions {
  /** Signing keys (the team's JWKS, or a local set in tests). */
  readonly keys: JWTVerifyGetKey;
  /** `https://<team>.cloudflareaccess.com`. */
  readonly issuer: string;
  /** The Access application's AUD tag. */
  readonly audience: string;
}

/**
 * Verifies a `Cf-Access-Jwt-Assertion` token: signature against the team's
 * keys, issuer, audience and expiry. Accepts both a person's login (has
 * `email`) and an Access service token (has `common_name`, no email).
 *
 * @param token - The header value, or null when absent.
 * @param options - Keys, issuer and audience.
 * @returns The identity, or null when missing or invalid for any reason.
 */
export async function verifyAccessJwt(
  token: string | null,
  options: VerifyOptions
): Promise<AccessIdentity | null> {
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, options.keys, {
      issuer: options.issuer,
      audience: options.audience,
      algorithms: ["RS256"],
    });
    const email = typeof payload.email === "string" ? payload.email : null;
    const serviceToken =
      typeof payload.common_name === "string" ? payload.common_name : null;
    if (email === null && serviceToken === null) {
      return null;
    }
    return { email, serviceToken };
  } catch {
    return null;
  }
}

const keysByTeam = new Map<string, JWTVerifyGetKey>();

/** The team's JWKS, fetched lazily and cached per isolate by `jose`. */
function teamKeys(team: string): JWTVerifyGetKey {
  let keys = keysByTeam.get(team);
  if (!keys) {
    keys = createRemoteJWKSet(new URL(`https://${team}/cdn-cgi/access/certs`));
    keysByTeam.set(team, keys);
  }
  return keys;
}

/** A JSON error response. */
function jsonError(status: number, error: string): Response {
  return Response.json(
    { error },
    { status, headers: { "cache-control": "no-store" } }
  );
}

/** Outcome of {@link authenticate}. */
export type AuthResult =
  | { readonly ok: true; readonly identity: AccessIdentity }
  | { readonly ok: false; readonly response: Response };

/**
 * Gate for every `/api` call, on top of Access at the edge. Fails closed:
 * 503 when `ACCESS_TEAM`/`ACCESS_AUD` are unset, 401 without a valid token.
 * `DEV_ACCESS_EMAIL` is honoured only for requests to `localhost`.
 *
 * @param request - Incoming request.
 * @param env - Worker env.
 * @param keys - Override for the JWKS (tests).
 * @returns The identity or the error response to return.
 */
export async function authenticate(
  request: Request,
  env: Env,
  keys?: JWTVerifyGetKey
): Promise<AuthResult> {
  if (env.DEV_ACCESS_EMAIL && new URL(request.url).hostname === "localhost") {
    return {
      ok: true,
      identity: { email: env.DEV_ACCESS_EMAIL, serviceToken: null },
    };
  }
  if (!env.ACCESS_TEAM || !env.ACCESS_AUD) {
    return { ok: false, response: jsonError(503, "access_not_configured") };
  }
  const identity = await verifyAccessJwt(
    request.headers.get("cf-access-jwt-assertion"),
    {
      keys: keys ?? teamKeys(env.ACCESS_TEAM),
      issuer: `https://${env.ACCESS_TEAM}`,
      audience: env.ACCESS_AUD,
    }
  );
  if (!identity) {
    return { ok: false, response: jsonError(401, "unauthorized") };
  }
  return { ok: true, identity };
}

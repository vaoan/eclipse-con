import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
  type JWTVerifyGetKey,
} from "jose";
import { beforeAll, describe, expect, it } from "vitest";
import { authenticate, verifyAccessJwt } from "./access";
import type { Env } from "./env";

const TEAM = "furrycolombia.cloudflareaccess.com";
const ISSUER = `https://${TEAM}`;
const AUD = "test-aud-tag";

let keys: JWTVerifyGetKey;
let privateKey: CryptoKey;
let otherPrivateKey: CryptoKey;

beforeAll(async () => {
  const pair = await generateKeyPair("RS256");
  const other = await generateKeyPair("RS256");
  privateKey = pair.privateKey;
  otherPrivateKey = other.privateKey;
  const jwk = { ...(await exportJWK(pair.publicKey)), kid: "k1", alg: "RS256" };
  keys = createLocalJWKSet({ keys: [jwk] });
});

/** Signs an Access-shaped token. */
function token(
  claims: Record<string, unknown>,
  options: { audience?: string; expiresIn?: string; key?: CryptoKey } = {}
): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid: "k1" })
    .setIssuer(ISSUER)
    .setAudience(options.audience ?? AUD)
    .setIssuedAt()
    .setExpirationTime(options.expiresIn ?? "1h")
    .sign(options.key ?? privateKey);
}

const verifyOptions = () => ({ keys, issuer: ISSUER, audience: AUD });

describe("verifyAccessJwt", () => {
  it("accepts a valid user token", async () => {
    const identity = await verifyAccessJwt(
      await token({ email: "furrycolombia@gmail.com" }),
      verifyOptions()
    );
    expect(identity).toEqual({
      email: "furrycolombia@gmail.com",
      serviceToken: null,
    });
  });

  it("accepts a service token (common_name, no email)", async () => {
    const identity = await verifyAccessJwt(
      await token({ common_name: "abc123.access" }),
      verifyOptions()
    );
    expect(identity).toEqual({ email: null, serviceToken: "abc123.access" });
  });

  it("rejects an expired token", async () => {
    const expired = await new SignJWT({ email: "a@b.co" })
      .setProtectedHeader({ alg: "RS256", kid: "k1" })
      .setIssuer(ISSUER)
      .setAudience(AUD)
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(privateKey);
    expect(await verifyAccessJwt(expired, verifyOptions())).toBeNull();
  });

  it("rejects the wrong audience", async () => {
    expect(
      await verifyAccessJwt(
        await token({ email: "a@b.co" }, { audience: "another-app" }),
        verifyOptions()
      )
    ).toBeNull();
  });

  it("rejects a token signed by another key", async () => {
    expect(
      await verifyAccessJwt(
        await token({ email: "a@b.co" }, { key: otherPrivateKey }),
        verifyOptions()
      )
    ).toBeNull();
  });

  it("rejects a missing or garbage token", async () => {
    expect(await verifyAccessJwt(null, verifyOptions())).toBeNull();
    expect(await verifyAccessJwt("not.a.jwt", verifyOptions())).toBeNull();
  });

  it("rejects a token with neither email nor common_name", async () => {
    expect(await verifyAccessJwt(await token({}), verifyOptions())).toBeNull();
  });
});

describe("authenticate", () => {
  const env = { ACCESS_TEAM: TEAM, ACCESS_AUD: AUD } as unknown as Env;

  it("fails closed with 503 when Access is not configured", async () => {
    const result = await authenticate(
      new Request("https://admin.fco.bz/api/me"),
      {} as Env,
      keys
    );
    expect(result.ok).toBe(false);
    expect(result.ok ? 0 : result.response.status).toBe(503);
  });

  it("returns 401 without a token", async () => {
    const result = await authenticate(
      new Request("https://admin.fco.bz/api/me"),
      env,
      keys
    );
    expect(result.ok ? 0 : result.response.status).toBe(401);
  });

  it("passes a valid Cf-Access-Jwt-Assertion", async () => {
    const result = await authenticate(
      new Request("https://admin.fco.bz/api/me", {
        headers: {
          "cf-access-jwt-assertion": await token({ email: "a@b.co" }),
        },
      }),
      env,
      keys
    );
    expect(result.ok && result.identity.email).toBe("a@b.co");
  });

  it("honours DEV_ACCESS_EMAIL only on localhost", async () => {
    const localEnv = { ...env, DEV_ACCESS_EMAIL: "dev@local" } as Env;
    const local = await authenticate(
      new Request("http://localhost:8787/api/me"),
      localEnv,
      keys
    );
    const remote = await authenticate(
      new Request("https://admin.fco.bz/api/me"),
      localEnv,
      keys
    );
    expect(local.ok && local.identity.email).toBe("dev@local");
    expect(remote.ok).toBe(false);
  });
});

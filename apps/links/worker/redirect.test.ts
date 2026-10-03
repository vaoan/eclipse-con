import { beforeEach, describe, expect, it } from "vitest";
import { FALLBACK_URL, type Env } from "./env";
import { FRESH_MS, loadLinks, resetLinkMemory } from "./linkCache";
import { handleRedirect, mergeQuery } from "./redirect";
import { createFailingDatabase, createTestDatabase } from "./test/d1";
import { makeRequest } from "./test/requests";

const NOW = Date.UTC(2026, 9, 3, 20, 30);

/** A Cache API stand-in backed by a Map. */
function memoryCache(): Cache {
  const store = new Map<string, Response>();
  return {
    match: (key: string) => Promise.resolve(store.get(key)?.clone()),
    put: (key: string, response: Response) => {
      store.set(key, response);
      return Promise.resolve();
    },
  } as unknown as Cache;
}

/** Env + D1 seeded with one active and one paused link. */
function setup() {
  const { database, raw } = createTestDatabase();
  raw.exec(`INSERT INTO links (slug, destination, campaign, active, first_seen, updated_at) VALUES
    ('s27', 'https://sunfest2027.furrycolombia.com/', 'sunfest2027', 1, 0, 0),
    ('old', 'https://example.org/old', NULL, 0, 0, 0)`);
  const env = { DB: database, VISITOR_HASH_KEY: "k" } as unknown as Env;
  const pending: Promise<unknown>[] = [];
  const context = {
    env,
    waitUntil: (promise: Promise<unknown>) => {
      pending.push(promise);
    },
    cache: undefined,
    now: NOW,
  };
  return { raw, env, context, flush: () => Promise.all(pending) };
}

beforeEach(() => {
  resetLinkMemory();
});

describe("handleRedirect", () => {
  it("302s a known slug with private, no-store caching", async () => {
    const { context } = setup();
    const response = await handleRedirect(
      makeRequest("https://fco.bz/s27"),
      context
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://sunfest2027.furrycolombia.com/"
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("is case-insensitive and passes the visitor's UTM tags through", async () => {
    const { context } = setup();
    const response = await handleRedirect(
      makeRequest("https://fco.bz/S27?utm_source=tg"),
      context
    );
    expect(response.headers.get("location")).toBe(
      "https://sunfest2027.furrycolombia.com/?utm_source=tg"
    );
  });

  it("logs the click after responding", async () => {
    const { context, raw, flush } = setup();
    await handleRedirect(makeRequest("https://fco.bz/s27"), context);
    await flush();
    expect(raw.prepare("SELECT slug, miss, human FROM clicks").all()).toEqual([
      { slug: "s27", miss: 0, human: 1 },
    ]);
  });

  it("sends unknown slugs to the fallback and logs a miss", async () => {
    const { context, raw, flush } = setup();
    const response = await handleRedirect(
      makeRequest("https://fco.bz/s72"),
      context
    );
    await flush();
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(FALLBACK_URL);
    expect(raw.prepare("SELECT slug, miss FROM clicks").all()).toEqual([
      { slug: "s72", miss: 1 },
    ]);
  });

  it("sends paused links to the fallback but still counts them", async () => {
    const { context, raw, flush } = setup();
    const response = await handleRedirect(
      makeRequest("https://fco.bz/old"),
      context
    );
    await flush();
    expect(response.headers.get("location")).toBe(FALLBACK_URL);
    expect(raw.prepare("SELECT slug, miss FROM clicks").all()).toEqual([
      { slug: "old", miss: 0 },
    ]);
  });

  it("redirects the root without logging", async () => {
    const { context, raw, flush } = setup();
    const response = await handleRedirect(
      makeRequest("https://fco.bz/"),
      context
    );
    await flush();
    expect(response.headers.get("location")).toBe(FALLBACK_URL);
    expect(raw.prepare("SELECT COUNT(*) AS n FROM clicks").get()).toEqual({
      n: 0,
    });
  });

  it("does not log HEAD requests", async () => {
    const { context, raw, flush } = setup();
    const response = await handleRedirect(
      new Request("https://fco.bz/s27", { method: "HEAD" }),
      context
    );
    await flush();
    expect(response.status).toBe(302);
    expect(raw.prepare("SELECT COUNT(*) AS n FROM clicks").get()).toEqual({
      n: 0,
    });
  });

  it("rejects other methods", async () => {
    const { context } = setup();
    const response = await handleRedirect(
      new Request("https://fco.bz/s27", { method: "POST" }),
      context
    );
    expect(response.status).toBe(405);
  });

  it("still redirects when click logging fails", async () => {
    const { context, raw, flush } = setup();
    await loadLinks(context.env.DB, undefined, NOW);
    raw.exec("DROP TABLE clicks");
    const response = await handleRedirect(
      makeRequest("https://fco.bz/s27"),
      context
    );
    await flush();
    expect(response.headers.get("location")).toBe(
      "https://sunfest2027.furrycolombia.com/"
    );
  });
});

describe("link cache", () => {
  it("serves the stale snapshot when D1 errors", async () => {
    const { env } = setup();
    const cache = memoryCache();
    await loadLinks(env.DB, cache, NOW);
    resetLinkMemory();

    const later = NOW + FRESH_MS * 10;
    const snapshot = await loadLinks(createFailingDatabase(), cache, later);
    expect(snapshot?.links.s27?.destination).toBe(
      "https://sunfest2027.furrycolombia.com/"
    );
  });

  it("keeps redirecting a known slug while D1 is down", async () => {
    const { env } = setup();
    const cache = memoryCache();
    await loadLinks(env.DB, cache, NOW);
    resetLinkMemory();

    const response = await handleRedirect(makeRequest("https://fco.bz/s27"), {
      env: { ...env, DB: createFailingDatabase() },
      waitUntil: () => undefined,
      cache,
      now: NOW + FRESH_MS * 10,
    });
    expect(response.headers.get("location")).toBe(
      "https://sunfest2027.furrycolombia.com/"
    );
  });

  it("falls back to furrycolombia.com only when nothing was ever cached", async () => {
    const response = await handleRedirect(makeRequest("https://fco.bz/s27"), {
      env: { DB: createFailingDatabase() } as unknown as Env,
      waitUntil: () => undefined,
      cache: undefined,
      now: NOW,
    });
    expect(response.headers.get("location")).toBe(FALLBACK_URL);
  });

  it("reuses a fresh snapshot without touching D1", async () => {
    const { env } = setup();
    await loadLinks(env.DB, undefined, NOW);
    const snapshot = await loadLinks(
      createFailingDatabase(),
      undefined,
      NOW + 1000
    );
    expect(snapshot?.fetchedAt).toBe(NOW);
  });
});

describe("mergeQuery", () => {
  it("keeps the destination's own parameters", () => {
    expect(
      mergeQuery(
        "https://example.org/?utm_source=print",
        new URLSearchParams("utm_source=tg&ref=x")
      )
    ).toBe("https://example.org/?utm_source=print&ref=x");
  });
});

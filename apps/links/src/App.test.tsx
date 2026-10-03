import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import { LINKS, ME, STATS, SYNC } from "@/testFixtures";

/** The URL a fetch call was made with. */
function urlOf(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  return input instanceof URL ? input.href : input.url;
}

/** Routes the dashboard's API calls to fixtures. */
function mockApi(status = 200) {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = urlOf(input);
    let body: unknown = {};
    if (url.startsWith("/api/me")) {
      body = ME;
    } else if (url.startsWith("/api/links")) {
      body = LINKS;
    } else if (url.startsWith("/api/sync")) {
      body = SYNC;
    } else if (url.startsWith("/api/stats")) {
      body = STATS;
    }
    return Promise.resolve(Response.json(body, { status }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("App", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: Date.UTC(2026, 9, 3, 20, 30), toFake: ["Date"] });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders the header, links, sync health and stats", async () => {
    mockApi();
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "header.title" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "fco.bz/s27" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "sync.title" })
    ).toBeInTheDocument();
    expect(await screen.findByTestId("stat-tiles")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "header.openSheet" })
    ).toHaveAttribute("href", ME.sheetUrl);
  });

  it("scopes the stats to a link when its slug is picked", async () => {
    const fetchMock = mockApi();
    render(<App />);
    (await screen.findByRole("button", { name: "fco.bz/s27" })).click();

    expect(
      await screen.findByRole("heading", { name: "scope.link" })
    ).toBeInTheDocument();
    await vi.waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([input]) =>
          urlOf(input).includes("slug=s27")
        )
      ).toBe(true);
    });
  });

  it("asks to reload when the Access session is gone", async () => {
    mockApi(401);
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "state.unauthorized"
    );
  });

  it("lists the stat tiles by key", async () => {
    mockApi();
    render(<App />);
    const tiles = await screen.findByTestId("stat-tiles");
    for (const key of [
      "tiles.clicks",
      "tiles.uniques",
      "tiles.shares",
      "tiles.bots",
    ]) {
      expect(within(tiles).getByText(key)).toBeInTheDocument();
    }
  });
});

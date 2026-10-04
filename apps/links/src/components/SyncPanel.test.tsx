import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SyncPanel } from "@/components/SyncPanel";
import { SYNC } from "@/testFixtures";

describe("SyncPanel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the last run, rejected rows and links missing from the Sheet", () => {
    render(<SyncPanel data={SYNC} onSynced={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "sync.lastRun · sync.ok"
    );
    expect(screen.getByText("sync.errors")).toBeInTheDocument();
    expect(screen.getByText(/✗ slug inválido/)).toBeInTheDocument();
    expect(screen.getByText("sync.missing")).toBeInTheDocument();
    expect(screen.getByText("sync.statsUpdated")).toBeInTheDocument();
  });

  it("says when the Sheet is not connected", () => {
    render(
      <SyncPanel
        data={{
          ...SYNC,
          state: {
            ran_at: 1,
            ok: 0,
            rows: 0,
            changed: 0,
            errors: "[]",
            message: "not_configured",
          },
        }}
        onSynced={vi.fn()}
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent("sync.notConfigured");
  });

  it("runs a sync with the CSRF header and refreshes", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(Response.json({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);
    const onSynced = vi.fn();
    render(<SyncPanel data={SYNC} onSynced={onSynced} />);

    fireEvent.click(screen.getByRole("button", { name: "sync.now" }));

    await waitFor(() => {
      expect(onSynced).toHaveBeenCalled();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sync",
      expect.objectContaining({
        method: "POST",
        headers: { "x-requested-with": "fetch" },
      })
    );
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LinksTable } from "@/components/LinksTable";
import { LINKS } from "@/testFixtures";

const TODAY = "2026-10-03";

describe("LinksTable", () => {
  it("lists every link with its badges", () => {
    render(
      <LinksTable
        data={LINKS}
        today={TODAY}
        scope={{ kind: "all" }}
        onScope={vi.fn()}
      />
    );
    expect(
      screen.getByRole("button", { name: "fco.bz/s27" })
    ).toBeInTheDocument();
    expect(screen.getByText("links.paused")).toBeInTheDocument();
    expect(screen.getByText("links.missing")).toBeInTheDocument();
    expect(screen.getByText("links.editHint")).toBeInTheDocument();
  });

  it("filters by the search box", () => {
    render(
      <LinksTable
        data={LINKS}
        today={TODAY}
        scope={{ kind: "all" }}
        onScope={vi.fn()}
      />
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "links.search" }), {
      target: { value: "telegram" },
    });
    expect(
      screen.getByRole("button", { name: "fco.bz/s27t" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "fco.bz/s27" })
    ).not.toBeInTheDocument();
  });

  it("shows the no-match message", () => {
    render(
      <LinksTable
        data={LINKS}
        today={TODAY}
        scope={{ kind: "all" }}
        onScope={vi.fn()}
      />
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "links.search" }), {
      target: { value: "zzz" },
    });
    expect(screen.getByText("links.noMatch")).toBeInTheDocument();
  });

  it("scopes to a slug or a campaign", () => {
    const onScope = vi.fn();
    render(
      <LinksTable
        data={LINKS}
        today={TODAY}
        scope={{ kind: "all" }}
        onScope={onScope}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "fco.bz/s27" }));
    fireEvent.click(screen.getAllByRole("button", { name: "sunfest2027" })[0]!);
    expect(onScope).toHaveBeenNthCalledWith(1, { kind: "slug", slug: "s27" });
    expect(onScope).toHaveBeenNthCalledWith(2, {
      kind: "campaign",
      campaign: "sunfest2027",
    });
  });

  it("shows the empty state", () => {
    render(
      <LinksTable
        data={{ ...LINKS, links: [] }}
        today={TODAY}
        scope={{ kind: "all" }}
        onScope={vi.fn()}
      />
    );
    expect(screen.getByText("links.empty")).toBeInTheDocument();
  });
});

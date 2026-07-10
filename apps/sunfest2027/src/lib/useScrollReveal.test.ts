import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useScrollReveal } from "@/lib/useScrollReveal";
import * as usePrefersReducedMotionModule from "@/lib/usePrefersReducedMotion";

describe("useScrollReveal", () => {
  it("defaults to revealed when IntersectionObserver is unavailable (jsdom)", () => {
    const { result } = renderHook(() => useScrollReveal());
    expect(result.current.revealed).toBe(true);
    expect(typeof result.current.ref).toBe("function");
  });

  it("reveals when reduced motion is (or becomes) preferred, even without ever intersecting", () => {
    vi.spyOn(
      usePrefersReducedMotionModule,
      "usePrefersReducedMotion"
    ).mockReturnValue(true);

    const { result } = renderHook(() => useScrollReveal());

    expect(result.current.revealed).toBe(true);

    vi.restoreAllMocks();
  });
});

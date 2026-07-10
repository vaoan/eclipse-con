import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useScrollReveal } from "@/lib/useScrollReveal";

describe("useScrollReveal", () => {
  it("defaults to revealed when IntersectionObserver is unavailable (jsdom)", () => {
    const { result } = renderHook(() => useScrollReveal());
    expect(result.current.revealed).toBe(true);
    expect(typeof result.current.ref).toBe("function");
  });
});

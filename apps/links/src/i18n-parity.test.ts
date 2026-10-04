import { describe, expect, it } from "vitest";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

/** Flatten nested keys into dotted paths for comparison. */
function keys(object: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(object).flatMap(([k, v]) =>
    v && typeof v === "object"
      ? keys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );
}

describe("i18n parity", () => {
  it("es and en have identical key sets", () => {
    expect(keys(es).sort((a, b) => a.localeCompare(b))).toEqual(
      keys(en).sort((a, b) => a.localeCompare(b))
    );
  });
});

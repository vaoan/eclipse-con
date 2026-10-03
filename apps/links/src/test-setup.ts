import "@testing-library/jest-dom";
import type * as I18n from "@/i18n";
import { vi } from "vitest";

/**
 * Tests assert against i18n label KEYS, not translated copy. `t` returns the
 * key it is given, so component tests stay locale- and wording-agnostic —
 * editing copy never breaks a test, and a test names the key it depends on.
 */
vi.mock("@/i18n", async (importOriginal) => {
  const actual = await importOriginal<typeof I18n>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        language: "es" as const,
        resolvedLanguage: "es" as const,
        changeLanguage: () => undefined,
      },
    }),
  };
});

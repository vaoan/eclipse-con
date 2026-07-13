import "@testing-library/jest-dom";
import type * as ReactI18next from "react-i18next";
import { vi } from "vitest";
import "@/i18n";

/**
 * Tests assert against i18n label KEYS, not translated copy. `t` returns the
 * key it is given, so component tests stay locale- and wording-agnostic —
 * editing copy never breaks a test, and a test names the key it depends on.
 */
vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactI18next>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        language: "es",
        changeLanguage: () => Promise.resolve(undefined),
      },
    }),
  };
});

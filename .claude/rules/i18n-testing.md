---
paths:
  - "**/*.test.{ts,tsx}"
  - "**/test-setup.ts"
  - "**/locales/**"
---

# i18n Testing

Loaded when a test or a locale file is read. Each line is the rule; the link is the full text.

- **Assert i18n keys, never translated copy**: `getByRole("heading", { name: "about.title" })`, not the English or Spanish wording. Copy changes constantly and every wording edit would break the test. → `docs/lessons/i18n-testing.md` (Rule)
- **The test setup mocks `react-i18next` so `t(key)` returns the key** (`src/test-setup.ts` in each app), so components render keys in tests. Do not render real translations. → `docs/lessons/i18n-testing.md` (How It Works)
- **When a key repeats (every gallery card shares `showcase.openItem`), select by `data-testid` (`tid()`) or `data-content-id`**, because the key alone is not unique. → `docs/lessons/i18n-testing.md` (Selecting Elements)
- **Data constants that are not copy (`SOCIALS[].label` = `"Instagram"`) may be matched directly.** → `docs/lessons/i18n-testing.md` (Selecting Elements)
- **Do not test that keys exist**: `copy.test.ts` and `i18n-parity.test.ts` already check `en` and `es` carry every key. A component test only checks the right key reaches the right element. → `docs/lessons/i18n-testing.md` (Key Existence)

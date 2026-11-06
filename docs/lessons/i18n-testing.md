# i18n Testing — Assert Keys, Not Copy

## Rule

Component tests assert against **i18n label keys**, never translated text. Copy and locale change constantly; text-based assertions are brittle and break on every wording edit. Keys are the stable contract.

```tsx
// Wrong — asserts translated copy (breaks when wording or locale changes)
screen.getByRole("heading", { name: "Sunfest 2027" });
screen.getByText(/Coffee culture|Cultura cafetera/);

// Correct — asserts the i18n key
screen.getByRole("heading", { name: "teaser.wordmark" });
screen.getByText("highlights.coffee");
```

## How It Works

The test setup mocks `react-i18next` so `useTranslation().t` returns the key it is given (`t("about.title") === "about.title"`). Components therefore render their keys in tests, and assertions name those keys.

```ts
// src/test-setup.ts
vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
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
```

## Selecting Elements

- **Text / labels / alt**: assert the key (`getByText("footer.rights")`, `alt === "teaser.bannerAlt"`).
- **Interpolated or duplicated labels** (e.g. every gallery card shares `showcase.openItem`): select by `data-testid` (`tid()`) or `data-content-id` instead — the key alone is not unique.
- **Data constants** that are not i18n copy (e.g. `SOCIALS[].label` = `"Instagram"`) may be matched directly; they are not translated strings.

## Key Existence

Do not test rendered translations for coverage. `copy.test.ts` and `i18n-parity.test.ts` already assert every key exists in both `es` and `en`. Component tests only verify the right key is wired to the right element.

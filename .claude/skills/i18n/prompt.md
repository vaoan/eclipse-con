# Internationalization (i18n)

Skill for managing translations and internationalization using react-i18next.

## Steps

1. **Add keys to both locale files**:
   - English: `src/locales/en.json`
   - Spanish: `src/locales/es.json`
   - Both files must always have matching key structures.

2. **Use dot notation for key naming**:
   - Pattern: `feature.section.key`
   - Examples:
     - `auth.login.title` -> "Log In"
     - `auth.login.emailLabel` -> "Email Address"
     - `dashboard.stats.totalUsers` -> "Total Users"
     - `common.actions.save` -> "Save"
     - `common.actions.cancel` -> "Cancel"
     - `common.errors.required` -> "This field is required"

3. **Keep translations organized by feature**:
   - Group keys under feature namespace at the top level.
   - Use `common` namespace for shared strings (buttons, labels, errors).
   - Keep related keys together.

4. **Use `useTranslation()` hook in components**:

   ```tsx
   import { useTranslation } from "react-i18next";

   export function MyComponent() {
     const { t } = useTranslation();
     return <h1>{t("feature.page.title")}</h1>;
   }
   ```

5. **Handle interpolation**:

   ```json
   { "greeting": "Hello, {{name}}!" }
   ```

   ```tsx
   t("greeting", { name: userName });
   ```

6. **Handle plurals**:
   ```json
   {
     "itemCount_one": "{{count}} item",
     "itemCount_other": "{{count}} items"
   }
   ```
   ```tsx
   t("itemCount", { count: items.length });
   ```

## Rules

- **Never hardcode display strings** in components.
- Every user-facing string must go through `t()`.
- Always add translations to ALL locale files simultaneously.
- Use descriptive key names that indicate context.
- Keep translation values short and clear.
- Do not use HTML in translation values; use Trans component for rich text if needed.

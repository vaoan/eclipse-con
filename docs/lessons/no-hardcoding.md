# No Hardcoding

## No Hardcoded Strings in UI

All user-facing text must go through the i18n system using `t()` from react-i18next.

```tsx
// Wrong
<h1>Welcome back</h1>

// Correct
<h1>{t('dashboard.welcomeBack')}</h1>
```

## No Magic Numbers

Extract numeric values into named constants with clear intent.

```ts
// Wrong
if (retries > 3) { ... }

// Correct
const MAX_RETRY_ATTEMPTS = 3;
if (retries > MAX_RETRY_ATTEMPTS) { ... }
```

## No Hardcoded URLs

All URLs and endpoints must come from environment configuration.

```ts
// Wrong
fetch("https://api.example.com/users");

// Correct
fetch(`${environment.apiBaseUrl}/users`);
```

## No Hardcoded Colors

Use Tailwind design tokens or CSS custom properties. Never use raw hex/rgb values in JSX or CSS.

```tsx
// Wrong
<div style={{ color: '#3b82f6' }}>

// Correct
<div className="text-primary">
```

## Exceptions

- Internal developer-facing strings (log messages, error codes) are exempt from i18n.
- Test fixtures may use hardcoded values for clarity.

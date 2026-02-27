<div align="center">

```
  ░▒▓█  M O O N F E S T  2 0 2 6  █▓▒░
```

<img src="https://img.shields.io/badge/Colombia's%20biggest%20furry%20event-July%2010–13%2C%202026-c9a84c?style=for-the-badge&labelColor=0a0b1a" alt="Event date" />

<br />

**[🌙 &nbsp;Live site → filedn.com/leGgCrrYIXV0YvzNNKbdzBb/index.html](https://filedn.com/leGgCrrYIXV0YvzNNKbdzBb/index.html)**

<br />

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=61dafb&labelColor=0a0b1a)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=3178c6&labelColor=0a0b1a)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite&logoColor=646cff&labelColor=0a0b1a)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=06b6d4&labelColor=0a0b1a)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-f59e0b?style=flat-square&logo=firebase&logoColor=f59e0b&labelColor=0a0b1a)](https://firebase.google.com)
[![PostHog](https://img.shields.io/badge/PostHog-Analytics-f54e00?style=flat-square&logo=posthog&logoColor=f54e00&labelColor=0a0b1a)](https://posthog.com)

<br />

_A privacy-first, single-file deployable SPA for the largest furry community convention in Colombia._

</div>

---

## ◐ &nbsp;What is Moonfest

**Moonfest 2026** is a four-day furry fandom convention held **July 10–13, 2026** at [Hotel Estelar Paipa](https://www.estelarpaipa.com), Colombia. This repository is the official event website — a React SPA that covers:

- 🌙 &nbsp;Event schedule, guests & activities
- 🏨 &nbsp;Venue, amenities and travel info
- 📋 &nbsp;Registration tutorial with step-by-step hotel + ticket guidance
- 📰 &nbsp;Live news feed from the Telegram channel (bilingual EN/ES)
- 🔒 &nbsp;Privacy-first analytics with full consent gating

The site is built to be deployed as a **single self-contained HTML file** (`dist-static/index.html`) with all fonts, images, and scripts inlined as data URIs — no CDN, no external requests at runtime.

---

## ✦ &nbsp;Tech Stack

| Layer             | Technology                        | Why                                                               |
| ----------------- | --------------------------------- | ----------------------------------------------------------------- |
| **Framework**     | React 19 + TypeScript 5           | Server-less SPA; strict mode; function-only components            |
| **Build**         | Vite 6 + esbuild                  | Fast HMR in dev; esbuild minification for production              |
| **Styling**       | Tailwind CSS v4 + CVA             | Utility-first; zero-runtime CSS; design tokens via `@theme`       |
| **UI Primitives** | Radix UI 1.4 + shadcn/ui          | Accessible headless components; no style lock-in                  |
| **Icons**         | Lucide React 0.474                | Tree-shaken SVG icon set                                          |
| **Routing**       | React Router 7                    | Hash-router for static/file:// deployment; browser-router for dev |
| **i18n**          | i18next 24 + react-i18next        | Bilingual EN/ES; auto language detection                          |
| **Analytics**     | PostHog + custom in-house layer   | Privacy-first; consent-gated; self-hosted first                   |
| **Unit Tests**    | Vitest 3 + Testing Library        | Co-located tests; fast Vite-native runner                         |
| **E2E Tests**     | Playwright 1.50 + axe-core        | Full browser automation; WCAG 2.1 AA accessibility scan           |
| **Audit**         | Lighthouse 13                     | Performance, accessibility, SEO, best-practices CI gate           |
| **Linting**       | ESLint 9 flat config + 13 plugins | SonarJS, Unicorn, react-hooks, import order, no-secrets           |
| **Formatting**    | Prettier 3.5                      | Auto-format on commit via lint-staged                             |
| **Image Opt.**    | sharp 0.34                        | WebP conversion + resize during static build                      |
| **Pkg Manager**   | pnpm 10                           | Fast installs; strict lockfile                                    |

---

## ◆ &nbsp;Architecture

```
src/
├── app/                    # Shell — router, providers, layouts
├── features/
│   ├── analytics/          # Consent gate, event tracking, PostHog export
│   ├── convention/         # All convention pages & sections
│   └── registration-tutorial/  # Step-by-step hotel + ticket guide
└── shared/                 # Cross-feature domain, hooks, UI, config
```

**Dependency rule**: `presentation → application → domain` (one direction only). Features never import from each other; shared code is the bridge.

**Static build pipeline** (`vite.config.ts`): After Vite bundles, a custom Vite plugin fetches every external URL (fonts, images, icons) and inlines them as base64 data URIs. Duplicate data URIs are deduplicated with variable hoisting (~286 KB saved). The result is a single portable `.html` file.

---

## ○ &nbsp;External Services & Accounts

| Service                       | Account / Key                                 | Purpose                                     | Required         |
| ----------------------------- | --------------------------------------------- | ------------------------------------------- | ---------------- |
| **Firebase Hosting**          | `moonfest-b63fa.web.app`                      | Primary production deployment               | For deploy       |
| **PostHog**                   | `VITE_POSTHOG_API_KEY` + `VITE_POSTHOG_HOST`  | Product analytics export                    | Optional         |
| **Custom analytics endpoint** | `VITE_ANALYTICS_ENDPOINT`                     | Self-hosted event ingest                    | Optional         |
| **Google Fonts**              | Public CDN                                    | Unbounded typeface (hero headings)          | Inlined at build |
| **Adobe Typekit**             | Kit `pgq2ndh`                                 | ITC Avant Garde Gothic Pro (body + display) | Inlined at build |
| **FilesDN CDN**               | `filedn.com/leGgCrrYIXV0YvzNNKbdzBb/`         | OG social preview image                     | Static asset     |
| **Telegram**                  | Channel export (`scripts/fetch-telegram.mjs`) | News feed content                           | Dev script       |
| **Azure Translator**          | `AZURE_TRANSLATOR_KEY` + region               | Telegram message translation (ES→EN)        | Dev script       |
| **OpenAI**                    | `OPENAI_API_KEY`                              | Fallback translation provider               | Dev script       |
| **Hotel Estelar Paipa**       | `www.estelarpaipa.com`                        | Venue images (inlined at build)             | Inlined at build |

> **Runtime deps in the static build = zero.** All fonts, images, and icons are inlined during `pnpm build:static`. The deployed file works offline.

---

## 🔒 &nbsp;Analytics — Every Flag Explained

The tracking system is built in-house (`src/features/analytics/`) with an optional PostHog export. Events are batched (flush every 5 s or 200-event queue limit), sanitized through an allowlist, and gated by consent category.

### Privacy architecture

| Mechanism              | Detail                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Session ID**         | Random UUID in `sessionStorage` — expires when tab closes                                                                        |
| **Anonymous ID**       | Random UUID in `localStorage` — persists across sessions for return visitor detection; never linked to identity                  |
| **PII filter**         | Regex-based detector drops values matching email, phone, SSN, passport, credit-card patterns before any event leaves the browser |
| **Path normalization** | `/users/123/profile` → `/users/:id/profile` — numeric/UUID segments are replaced with `:id`                                      |
| **Query sanitization** | Query _values_ are never sent; only key names, filtered against a sensitive-token denylist                                       |
| **Allowlist**          | Each event type declares exactly which payload keys are permitted (`EVENT_DATA_ALLOWLIST`); extra keys are stripped silently     |

---

### Necessary events — always on, no consent required

These run regardless of consent choice because they serve operational reliability, not behavioral profiling. They contain no identifiable information beyond pseudonymous IDs.

<details>
<summary><strong>Session lifecycle</strong></summary>

| Event               | Why it exists                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session_start`     | Establishes session baseline: viewport bucket, device class, locale, referral channel. Without this we can't tell if the site loaded at all in a given region.      |
| `session_end`       | Records session duration and page-count bucket. Identifies sessions that bounce in under 5 s (load failure signal) vs. sessions with genuine engagement.            |
| `visibility_change` | Fires when the tab becomes hidden/visible. Distinguishes a long dwell (tab open, user reading) from a genuine abandoned session. Affects session duration accuracy. |
| `network_change`    | Records connectivity transitions (4G→wifi, online→offline). Used to correlate conversion drops with network quality events.                                         |

</details>

<details>
<summary><strong>Navigation & availability</strong></summary>

| Event                 | Why it exists                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page_view`           | Core navigation signal. Records path bucket, locale, referrer domain bucket. Required to know whether routing is working correctly in the hash-router static build. |
| `section_impression`  | Fires when a section enters the viewport for ≥500 ms. Detects sections that are never reached (layout regressions, dead scroll zones).                              |
| `outbound_link_click` | Records domain bucket of clicked external links (hotel site, ticket platform, social). Identifies broken or abandoned handoff links without capturing the full URL. |

</details>

<details>
<summary><strong>Runtime health</strong></summary>

| Event                 | Why it exists                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `page_load_failure`   | Fires on resource load errors (images, fonts). Detects CDN outages or broken asset paths after a deployment.                             |
| `media_load_health`   | Aggregated signal for media elements (video/audio). Distinguishes slow-network stalls from genuine 404s.                                 |
| `js_error`            | Captures unhandled JS exceptions: message bucket, source file, line. Essential for catching production regressions that unit tests miss. |
| `unhandled_rejection` | Captures unhandled Promise rejections. Async errors (fetch failures, import() misses) would be invisible without this.                   |

</details>

<details>
<summary><strong>Performance & compatibility</strong></summary>

| Event                      | Why it exists                                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `performance_snapshot`     | Records Core Web Vitals buckets (LCP, FID, CLS, TTFB, INP) at page stabilization. Tracks performance regressions across builds without a synthetic lab setup.                        |
| `device_performance_class` | Classifies device into `low`/`mid`/`high` using CPU cores + memory heuristics. Lets us decide when to reduce animation complexity or defer heavy content.                            |
| `accessibility_usage`      | Detects assistive technology signals (keyboard-only navigation, prefers-reduced-motion, high-contrast). Ensures we don't inadvertently regress screen reader or keyboard-only users. |

</details>

<details>
<summary><strong>Locale & acquisition</strong></summary>

| Event                        | Why it exists                                                                                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locale_switch`              | Fires when the user changes language (EN↔ES). Measures genuine language preference vs. browser default. Informs content prioritization (Spanish-first vs. bilingual parity). |
| `referral_campaign_bucket`   | Classifies the referrer into coarse buckets (social, search, direct, partner). No UTM values or full URLs are stored — just the channel bucket.                              |
| `consent_preference_updated` | Auditable record of every consent decision: category, new state, method (accept_all / customize / reject). Required for GDPR/CCPA compliance audit trails.                   |

</details>

---

### Analytics events — opt-in, require user consent

These events fire only after the user grants Analytics consent. They enable UX improvement and conversion optimization. No event in this tier collects names, emails, or device fingerprints.

<details>
<summary><strong>Interaction quality</strong></summary>

| Event                       | Why it exists                                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `click`                     | Generic interaction signal with element type bucket + section context. Surfaces unexpected tap targets and dead zones.                                            |
| `rage_click`                | ≥3 clicks on the same element within 700 ms. Primary friction detector — identifies buttons that look clickable but aren't, or CTAs that are too slow to respond. |
| `scroll_depth`              | Measures how far users scroll (25/50/75/90/100% thresholds). Determines whether the registration CTA and pricing sections are actually being seen.                |
| `time_to_first_interaction` | Time from page load to first meaningful user interaction, bucketed. High values suggest the page feels slow or unresponsive even if LCP is fine.                  |
| `navigation_menu_usage`     | Records which nav items are used and from where. Identifies navigation labels that confuse users (high open rate, low click-through).                             |

</details>

<details>
<summary><strong>Form & search quality</strong></summary>

| Event                | Why it exists                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `field_change`       | Records which form fields are interacted with and in what order. Identifies fields that users skip or repeatedly correct.                        |
| `form_submit`        | Fires on form submission attempt with success/failure outcome. Measures completion rate per form type.                                           |
| `form_error_type`    | Categorizes validation errors by type (required, format, length). Distinguishes UX problems (confusing field labels) from genuine user mistakes. |
| `search_interaction` | Records search query length bucket and result count bucket. Identifies zero-result searches that indicate missing content.                       |
| `copy_interaction`   | Fires when users copy text (bank account numbers, reference codes). Confirms that copy-to-clipboard affordances are being discovered and used.   |

</details>

<details>
<summary><strong>Content & section engagement</strong></summary>

| Event                    | Why it exists                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dwell_time_per_section` | Records time spent in each page section above a minimum threshold. Distinguishes sections users read carefully from sections they scroll past.                     |
| `news_engagement`        | Tracks interactions with the Telegram news feed (expand, collapse, media view). Determines whether the news section drives engagement or adds noise.               |
| `faq_interaction`        | Records which FAQ items are opened, how long they stay open, and whether users scroll away immediately. Converts raw FAQ usage into actionable content gaps.       |
| `content_interaction`    | Attribute-driven (`data-content-section`, `data-content-id`). Captures structured engagement signals on tagged content blocks without per-element instrumentation. |

</details>

<details>
<summary><strong>CTA & funnel conversion</strong></summary>

| Event                          | Why it exists                                                                                                                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cta_visibility`               | Records when a CTA enters the viewport using IntersectionObserver. Differentiates between CTAs that were never seen (placement problem) vs. seen but ignored (messaging problem). |
| `cta_interaction`              | Records clicks on tagged CTAs with position bucket and variant. Measures conversion rate per CTA placement and copy variant.                                                      |
| `funnel_step`                  | Attribute-driven (`data-funnel-step`). Tracks progression through the multi-step hotel + ticket reservation journey. Identifies exactly which step has the highest drop-off.      |
| `reservation_lead_time_bucket` | Buckets how far in advance users arrive at the registration flow relative to the event date (July 10). Helps time urgency messaging and early-bird promotions.                    |
| `network_quality_impact`       | Correlates connection type/speed with conversion outcomes. Identifies whether slow users are abandoning at specific funnel steps due to network-sensitive content.                |

</details>

<details>
<summary><strong>Journey & experimentation</strong></summary>

| Event                     | Why it exists                                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `navigation_transition`   | Records every route change with source/destination pair. Builds a navigation graph to identify unexpected journeys (users hitting the registration page from FAQ, etc.).         |
| `nav_path_cluster`        | Periodically snapshots the session's path sequence. Enables post-hoc clustering of user journeys without storing individual paths server-side.                                   |
| `return_intent`           | Fires on beforeunload when the user has meaningful engagement (scroll ≥50%, dwell ≥30 s). Identifies sessions with intent but no conversion — the highest-value recovery target. |
| `experiment_exposure`     | Attribute-driven (`data-experiment-id`, `data-variant-id`). Records which experiment variant was seen. Decoupled from the experiment logic — just the exposure signal.           |
| `engagement_score_bucket` | Composite score (scroll depth × dwell time × interaction count) bucketed into low/medium/high. Single-metric proxy for session quality without storing raw behavior logs.        |
| `error_recovery`          | Fires when a user successfully completes an action after a prior error on the same element. Measures resilience of the UX — did the error message actually help?                 |

</details>

<details>
<summary><strong>Optional demographics (explicit submission only)</strong></summary>

| Event                    | Why it exists                                                                                                                                                                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `demographics_submitted` | Fires only when a user actively submits a demographics survey (never auto-collected). Allowlisted fields: `gender` (from a closed set), `ageRange` (bucket), `attendeeType`, `regionBucket`, `country` (ISO-2). Sensitivity: `medium`. Used for aggregate audience composition reports — never for individual profiling. |

</details>

---

### Proposed events — not yet implemented

| Event                                   | Trigger                                            | Business reason                                                                           |
| --------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `registration_tutorial_step_selected`   | User clicks a tutorial step card                   | Detect which step attracts most attention/confusion in the two-payment journey            |
| `registration_tutorial_step_toggled`    | User marks a step done/pending                     | Identify checklist friction and verify whether the tutorial structure reduces uncertainty |
| `registration_tutorial_progress_bucket` | Tutorial progress crosses 33/66/100%               | Measure tutorial completion quality before checkout intent                                |
| `faq_blocker_theme`                     | FAQ item opens on a reservation/ticket blocker     | Convert raw FAQ usage into actionable blocker categories                                  |
| `reserve_ticket_handoff`                | User clicks reserve + ticket links in same session | Measure handoff quality between hotel reservation and ticket steps                        |

---

### Consent model

```
┌─────────────────────────────────────────────────────────────────┐
│  Consent Gate (shown on first visit, re-openable any time)      │
├──────────────┬──────────────┬─────────────────┬─────────────────┤
│  Necessary   │  Analytics   │ Personalization │ Conv. Growth    │
│  Always ON   │  Opt-in      │  Opt-in         │   Opt-in        │
│              │              │  (stored,       │   (stored,      │
│  ~15 events  │  ~40 events  │  future attend. │   future reach  │
│              │              │  tailoring)     │   insights)     │
└──────────────┴──────────────┴─────────────────┴─────────────────┘
```

Consent is stored in `localStorage` under key `tracking_consent_v1`. Users can **Accept all** or **Only necessary** at any time. No dark patterns — both options have equal visual weight.

---

## ◑ &nbsp;Development

```bash
pnpm dev              # Dev server at http://localhost:5173
pnpm build            # Production build → dist/
pnpm build:static     # Self-contained single-file build → dist-static/index.html
pnpm preview          # Preview production build
pnpm typecheck        # TypeScript type checking
pnpm lint             # ESLint (0 warnings allowed)
pnpm format           # Prettier (write)
pnpm format:check     # Prettier (check only)
pnpm test             # Unit tests (Vitest)
pnpm test:coverage    # Unit tests + coverage report
pnpm test:e2e         # Playwright E2E + axe accessibility scan
```

### Before every commit

```bash
pnpm typecheck && pnpm lint && pnpm build
```

_(lint-staged + Husky enforce this automatically on `git commit`)_

---

## ○ &nbsp;Environment Variables

| Variable                  | Default                    | Purpose                                   |
| ------------------------- | -------------------------- | ----------------------------------------- |
| `VITE_APP_NAME`           | `Moonfest 2026`            | App display name                          |
| `VITE_DEFAULT_LOCALE`     | `en`                       | Fallback locale                           |
| `VITE_SUPPORTED_LOCALES`  | `en,es`                    | Comma-separated locale list               |
| `VITE_ANALYTICS_ENABLED`  | `true`                     | Master kill-switch for all tracking       |
| `VITE_ANALYTICS_ENDPOINT` | _(empty)_                  | Custom event ingest URL (optional)        |
| `VITE_POSTHOG_API_KEY`    | _(empty)_                  | PostHog project API key (optional)        |
| `VITE_POSTHOG_HOST`       | `https://us.i.posthog.com` | PostHog instance URL                      |
| `VITE_DEBUG`              | `false`                    | Verbose console logging                   |
| `VITE_APP_VERSION`        | auto-bumped                | Build version (bumped by pre-commit hook) |

Safe defaults live in `.env.development` (committed). Secrets go in `.env.local` (gitignored).

---

<div align="center">

```
  ✦  built for the fandom  ·  Colombia  ·  July 2026  ✦
```

<img src="https://img.shields.io/badge/WCAG_2.1-AA_compliant-22c55e?style=flat-square&labelColor=0a0b1a" />
<img src="https://img.shields.io/badge/offline_capable-single_HTML_file-c9a84c?style=flat-square&labelColor=0a0b1a" />
<img src="https://img.shields.io/badge/no_runtime_CDN_deps-privacy_first-b8b3c7?style=flat-square&labelColor=0a0b1a" />

</div>

### Data minimization and safety controls

- All events are sanitized through an allowlist (`EVENT_DATA_ALLOWLIST`).
- Only approved keys per event are kept.
- Paths are sanitized (`/users/123` -> `/users/:id` style normalization).
- Query values are never sent, only sanitized query key names.
- Suspicious PII-like keys/values (email/phone-like patterns, sensitive tokens) are dropped.
- Base IDs are pseudonymous: `sessionId` (session storage) and `anonymousId` (local storage).
- Query key names are sanitized and filtered against a sensitive token denylist before export.

### Consent model (current implementation)

- `Necessary` is always enabled — operations, reliability, and consent auditing.
- `Analytics` gates all optional behavioral and funnel tracking — the primary source for planning future editions.
- `Personalization` preference is stored for a future feature that will tailor schedules and communications per attendee; no separate trackers active yet.
- `Convention Growth` (internally `advertising` field) preference is stored to inform outreach and community growth decisions for future Moonfest editions; no third-party ad pixels or platforms are active.

### What we track and why

#### Necessary (always on): operations, reliability, and consent auditing

- Session + reliability:
  - `session_start`, `session_end`, `network_change`, `visibility_change`.
  - Why: service health, session quality, and reliability diagnostics.
- Core navigation and availability:
  - `page_view`, `section_impression`, `outbound_link_click`.
  - Why: validate navigation flow and detect broken/abandoned paths.
- Runtime and loading health:
  - `page_load_failure`, `media_load_health`, `js_error`, `unhandled_rejection`.
  - Why: detect production failures fast and recover user experience.
- Performance + compatibility:
  - `performance_snapshot`, `device_performance_class`, `accessibility_usage`.
  - Why: monitor Core Web Vitals buckets and accessibility context to keep the site usable.
- Locale and channel context:
  - `locale_switch`, `referral_campaign_bucket`, `consent_preference_updated`.
  - Why: understand language demand, acquisition channel mix, and keep consent decisions auditable.
  - `session_start` and `page_view` include coarse `browserLanguage` (`en`/`es`) as a proxy for preferred device language.

#### Optional (requires Analytics consent): planning a better Moonfest

- Interaction quality:
  - `click`, `rage_click`, `scroll_depth`, `time_to_first_interaction`, `navigation_menu_usage`.
  - Why: identify friction and confusing UI zones.
- Form and search quality:
  - `field_change`, `form_submit`, `form_error_type`, `search_interaction`, `copy_interaction`.
  - Why: improve completion rates and reduce errors in key journeys.
- Content and section engagement:
  - `dwell_time_per_section`, `news_engagement`, `faq_interaction`, `content_interaction`.
  - Why: prioritize content that helps attendees complete reservation + ticket steps.
- CTA/funnel conversion:
  - `cta_visibility`, `cta_interaction`, `funnel_step`, `reservation_lead_time_bucket`, `network_quality_impact`.
  - Why: measure conversion bottlenecks and optimize high-impact CTAs.
- Journey and experimentation:
  - `navigation_transition`, `nav_path_cluster`, `return_intent`, `experiment_exposure`, `engagement_score_bucket`, `error_recovery`.
  - Why: improve pathing and validate changes safely with controlled experiments.
- Optional demographics (when explicitly submitted):
  - `demographics_submitted` with allowlisted options only (`gender`, `ageRange`, optional `attendeeType`, `regionBucket`, `country` ISO-2).
  - Why: understand audience composition at aggregate level without storing direct identifiers.

### Attribute-based auto-capture (Analytics consent required)

- `data-funnel-step` (+ optional `data-cta-id`, `data-cta-variant`) -> `funnel_step`
- `data-content-section` + `data-content-id` (+ optional `data-content-interaction`) -> `content_interaction`
- `data-experiment-id` + `data-variant-id` -> `experiment_exposure`

### Consent classification matrix

| event_name                              | current_or_proposed | consent_flag | justification                                   | sensitivity_level |
| --------------------------------------- | ------------------- | ------------ | ----------------------------------------------- | ----------------- |
| `session_start`                         | `current`           | `necessary`  | Session initialization and baseline diagnostics | `low`             |
| `session_end`                           | `current`           | `necessary`  | Session duration and reliability summary        | `low`             |
| `page_view`                             | `current`           | `necessary`  | Core navigation and availability tracking       | `low`             |
| `section_impression`                    | `current`           | `necessary`  | Section rendering/visibility diagnostics        | `low`             |
| `outbound_link_click`                   | `current`           | `necessary`  | Safe outbound navigation monitoring             | `low`             |
| `page_load_failure`                     | `current`           | `necessary`  | Resource failure diagnostics                    | `low`             |
| `media_load_health`                     | `current`           | `necessary`  | Media delivery health monitoring                | `low`             |
| `copy_interaction`                      | `current`           | `analytics`  | Optional content utility measurement            | `low`             |
| `search_interaction`                    | `current`           | `analytics`  | Optional search UX optimization                 | `low`             |
| `dwell_time_per_section`                | `current`           | `analytics`  | Optional section engagement analysis            | `low`             |
| `return_intent`                         | `current`           | `analytics`  | Optional exit-intent friction analysis          | `low`             |
| `cta_visibility`                        | `current`           | `analytics`  | Optional CTA viewability analysis               | `low`             |
| `nav_path_cluster`                      | `current`           | `analytics`  | Optional path clustering for UX decisions       | `low`             |
| `form_error_type`                       | `current`           | `analytics`  | Optional form friction diagnostics              | `low`             |
| `media_watch_progress`                  | `current`           | `analytics`  | Optional media engagement tracking              | `low`             |
| `network_quality_impact`                | `current`           | `analytics`  | Optional network impact on funnel steps         | `low`             |
| `device_performance_class`              | `current`           | `necessary`  | Runtime compatibility and stability             | `low`             |
| `engagement_score_bucket`               | `current`           | `analytics`  | Optional engagement quality segmentation        | `low`             |
| `referral_campaign_bucket`              | `current`           | `necessary`  | Aggregate acquisition channel diagnostics       | `low`             |
| `accessibility_usage`                   | `current`           | `necessary`  | Compatibility/accessibility diagnostics         | `low`             |
| `error_recovery`                        | `current`           | `analytics`  | Optional journey resilience insights            | `low`             |
| `reservation_lead_time_bucket`          | `current`           | `analytics`  | Optional reservation timing behavior            | `low`             |
| `locale_switch`                         | `current`           | `necessary`  | Localization reliability and demand             | `low`             |
| `navigation_menu_usage`                 | `current`           | `analytics`  | Optional navigation UX optimization             | `low`             |
| `time_to_first_interaction`             | `current`           | `analytics`  | Optional responsiveness and engagement signal   | `low`             |
| `scroll_depth`                          | `current`           | `analytics`  | Optional content reach measurement              | `low`             |
| `click`                                 | `current`           | `analytics`  | Optional interaction pattern analysis           | `low`             |
| `rage_click`                            | `current`           | `analytics`  | Optional frustration detection                  | `low`             |
| `form_submit`                           | `current`           | `analytics`  | Optional completion behavior measurement        | `low`             |
| `field_change`                          | `current`           | `analytics`  | Optional form interaction analysis              | `low`             |
| `visibility_change`                     | `current`           | `necessary`  | Session activity/reliability signals            | `low`             |
| `js_error`                              | `current`           | `necessary`  | Frontend runtime error diagnostics              | `low`             |
| `unhandled_rejection`                   | `current`           | `necessary`  | Promise/runtime failure diagnostics             | `low`             |
| `network_change`                        | `current`           | `necessary`  | Connectivity reliability context                | `low`             |
| `performance_snapshot`                  | `current`           | `necessary`  | Core Web Vitals bucket monitoring               | `low`             |
| `demographics_submitted`                | `current`           | `analytics`  | Optional aggregate audience insights            | `medium`          |
| `navigation_transition`                 | `current`           | `analytics`  | Optional journey path analysis                  | `low`             |
| `cta_interaction`                       | `current`           | `analytics`  | Optional CTA effectiveness analysis             | `low`             |
| `faq_interaction`                       | `current`           | `analytics`  | Optional blocker discovery in FAQ               | `low`             |
| `news_engagement`                       | `current`           | `analytics`  | Optional content format optimization            | `low`             |
| `content_interaction`                   | `current`           | `analytics`  | Optional section/content engagement analysis    | `low`             |
| `funnel_step`                           | `current`           | `analytics`  | Optional conversion-step tracking               | `low`             |
| `experiment_exposure`                   | `current`           | `analytics`  | Optional experiment readouts                    | `low`             |
| `consent_preference_updated`            | `current`           | `necessary`  | Consent decision audit trail                    | `medium`          |
| `registration_tutorial_step_selected`   | `current`           | `analytics`  | Optional tutorial navigation analysis           | `low`             |
| `registration_tutorial_step_toggled`    | `current`           | `analytics`  | Optional checklist completion analysis          | `low`             |
| `registration_tutorial_progress_bucket` | `current`           | `analytics`  | Optional tutorial completion benchmarking       | `low`             |
| `faq_blocker_theme`                     | `current`           | `analytics`  | Optional blocker taxonomy for FAQ               | `low`             |
| `reserve_ticket_handoff`                | `current`           | `analytics`  | Optional two-step conversion handoff analysis   | `low`             |

### In-app consent UX

- Users can `Accept all` or `Only necessary`.
- Settings can be reopened from the floating **Manage consent** button.

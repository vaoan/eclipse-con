# eclipse-con

## Tracking and Consent

### Data minimization and safety controls

- All events are sanitized through an allowlist (`EVENT_DATA_ALLOWLIST`).
- Only approved keys per event are kept.
- Paths are sanitized (`/users/123` -> `/users/:id` style normalization).
- Query values are never sent, only sanitized query key names.
- Suspicious PII-like keys/values (email/phone-like patterns, sensitive tokens) are dropped.
- Base IDs are pseudonymous: `sessionId` (session storage) and `anonymousId` (local storage).

### Consent model (current implementation)

- `Necessary` is always enabled.
- `Analytics` gates all optional behavioral and funnel tracking.
- `Personalization` and `Advertising` preferences are stored, but no separate trackers are currently activated by those toggles.

### What we track and why

#### Necessary (always on)

- Session + reliability:
  - `session_start`, `session_end`, `network_change`, `visibility_change`
  - Why: service health, session quality, and reliability diagnostics.
- Core navigation and availability:
  - `page_view`, `section_impression`, `outbound_link_click`
  - Why: validate navigation flow and detect broken/abandoned paths.
- Runtime and loading health:
  - `page_load_failure`, `media_load_health`, `js_error`, `unhandled_rejection`
  - Why: detect production failures fast and recover user experience.
- Performance + compatibility:
  - `performance_snapshot`, `device_performance_class`, `accessibility_usage`
  - Why: monitor Core Web Vitals buckets and accessibility context to keep the site usable.
- Locale and channel context:
  - `locale_switch`, `referral_campaign_bucket`, `consent_preference_updated`
  - Why: understand language demand and acquisition channel mix at aggregate level.
  - `consent_preference_updated` includes selected consent categories and `updatedAt` so consent decisions are auditable in analytics exports.
  - `session_start` and `page_view` include coarse `browserLanguage` (primary browser language tag like `en`/`es`) as a proxy for preferred device language.

#### Optional (requires Analytics consent)

- Interaction quality:
  - `click`, `rage_click`, `scroll_depth`, `time_to_first_interaction`, `navigation_menu_usage`
  - Why: identify friction and confusing UI zones.
- Form and search quality:
  - `field_change`, `form_submit`, `form_error_type`, `search_interaction`, `copy_interaction`
  - Why: improve completion rates and reduce errors in key journeys.
- Content and section engagement:
  - `dwell_time_per_section`, `news_engagement`, `faq_interaction`, `content_interaction`
  - Why: prioritize content that helps attendees complete reservation + ticket steps.
- CTA/funnel conversion:
  - `cta_visibility`, `cta_interaction`, `funnel_step`, `reservation_lead_time_bucket`, `network_quality_impact`
  - Why: measure conversion bottlenecks and optimize high-impact CTAs.
- Journey and experimentation:
  - `navigation_transition`, `nav_path_cluster`, `return_intent`, `experiment_exposure`, `engagement_score_bucket`, `error_recovery`
  - Why: improve pathing and validate changes safely with controlled experiments.
- Optional demographics (when explicitly submitted):
  - `demographics_submitted` with allowlisted options only (`gender`, `ageRange`, optional `attendeeType`, `regionBucket`, `country` ISO-2).
  - Why: understand audience composition at aggregate level without storing direct identifiers.

### Attribute-based auto-capture (Analytics consent required)

- `data-funnel-step` (+ optional `data-cta-id`, `data-cta-variant`) -> `funnel_step`
- `data-content-section` + `data-content-id` (+ optional `data-content-interaction`) -> `content_interaction`
- `data-experiment-id` + `data-variant-id` -> `experiment_exposure`

### In-app consent UX

- Users can `Accept all`, `Save selection`, or `Reject optional`.
- Settings can be reopened from the floating **Manage consent** button.

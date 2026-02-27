# eclipse-con

## Tracking and Consent

### Data minimization and safety controls

- All events are sanitized through an allowlist (`EVENT_DATA_ALLOWLIST`).
- Only approved keys per event are kept.
- Paths are sanitized (`/users/123` -> `/users/:id` style normalization).
- Query values are never sent, only sanitized query key names.
- Suspicious PII-like keys/values (email/phone-like patterns, sensitive tokens) are dropped.
- Base IDs are pseudonymous: `sessionId` (session storage) and `anonymousId` (local storage).
- Query key names are sanitized and filtered against a sensitive token denylist before export.

### Consent model (current implementation)

- `Necessary` is always enabled.
- `Analytics` gates all optional behavioral and funnel tracking.
- `Personalization` and `Advertising` preferences are stored for future use, but no separate trackers are currently activated by those toggles.
- There are no active third-party advertising pixels/tags in the current implementation.

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

#### Optional (requires Analytics consent): UX quality and conversion optimization

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

### Tracking opportunities from UX/copy context (proposed, not implemented)

| event_name                              | trigger_source                                            | safe_payload_keys               | business_reason                                                                       | expected_owner |
| --------------------------------------- | --------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------- | -------------- |
| `registration_tutorial_step_selected`   | User clicks a tutorial step card in registration tutorial | `stepNumber`, `origin`          | Detect which step attracts most attention/confusion in the two-payment journey        | Product        |
| `registration_tutorial_step_toggled`    | User marks a tutorial step done/pending                   | `stepNumber`, `nextState`       | Identify checklist friction and verify whether tutorial structure reduces uncertainty | Product        |
| `registration_tutorial_progress_bucket` | Tutorial progress crosses 33/66/100%                      | `bucket`, `activeStep`          | Measure tutorial completion quality before checkout intent                            | Growth         |
| `faq_blocker_theme`                     | FAQ item opens on reservation/ticket blockers             | `faqId`, `theme`                | Convert raw FAQ usage into actionable blocker categories                              | Ops            |
| `reserve_ticket_handoff`                | User clicks reserve/ticket links during the same session  | `sourceSurface`, `targetAction` | Measure handoff quality between hotel reservation and ticket steps                    | Growth         |

### Consent classification matrix (current + proposed)

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
| `registration_tutorial_step_selected`   | `proposed`          | `analytics`  | Optional tutorial navigation analysis           | `low`             |
| `registration_tutorial_step_toggled`    | `proposed`          | `analytics`  | Optional checklist completion analysis          | `low`             |
| `registration_tutorial_progress_bucket` | `proposed`          | `analytics`  | Optional tutorial completion benchmarking       | `low`             |
| `faq_blocker_theme`                     | `proposed`          | `analytics`  | Optional blocker taxonomy for FAQ               | `low`             |
| `reserve_ticket_handoff`                | `proposed`          | `analytics`  | Optional two-step conversion handoff analysis   | `low`             |

### In-app consent UX

- Users can `Accept all`, `Save selection`, or `Reject optional`.
- Settings can be reopened from the floating **Manage consent** button.

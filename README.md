# eclipse-con

## Tracking and Consent

The app uses a two-tier tracking model:

- `Always on (no optional consent required)`:
  - `session_start`
    - Includes: `deviceBucket`, `osFamily`, `browserFamily`, `referrerBucket`, `connectionType`
  - `session_end`
    - Includes: `durationBucket`, `pagesPerSessionBucket`, `activeTimeBucket`
  - `page_view`
    - Includes: `trigger`, `path`, `deviceBucket`, `osFamily`, `browserFamily`, `referrerBucket`, `connectionType`
  - `section_impression`
    - Includes: `sectionId`
  - `outbound_link_click`
    - Includes: `domainBucket`
  - `page_load_failure`
    - Includes: `resourceType`
  - `media_load_health`
    - Includes: `mediaType`, `status`
  - `device_performance_class`
    - Includes: `performanceClass`
  - `referral_campaign_bucket`
    - Includes: `bucket` (`utm_present`, `ad_click_id`, `none`)
  - `accessibility_usage`
    - Includes: `mode` (for example `keyboard_navigation`, `reduced_motion`)
  - `locale_switch`
    - Includes: `toLocale`
  - `navigation_menu_usage`
    - Includes: `action`
  - `time_to_first_interaction`
    - Includes: `bucket`
  - `visibility_change`
  - `js_error`
  - `unhandled_rejection`
  - `network_change`
    - Includes: `online`, `connectionType`
  - `performance_snapshot`
    - Includes: `domComplete`, `loadEventEnd`, `firstPaint`, `firstContentfulPaint`, `largestContentfulPaintBucket`, `cumulativeLayoutShiftBucket`, `interactionToNextPaintBucket`

- `Requires Analytics consent`:
  - `click`
  - `rage_click`
  - `scroll_depth`
  - `form_submit`
  - `field_change`
  - `demographics_submitted`
    - Optional safe fields: `ageRange`, `gender`, `country` (ISO 3166-1 alpha-2 code, e.g. `CO`, `US`)
  - `navigation_transition`
    - Includes: `fromPath`, `toPath` (sanitized path only)
  - `cta_interaction`
    - Includes: `ctaId`, `ctaVariant`, `ctaPosition`, `sectionId`
  - `faq_interaction`
    - Includes: `faqId`, `action`
  - `news_engagement`
    - Includes: `action`, `layoutMode`, `itemId`
  - `copy_interaction`
    - Includes: `sourceId`
  - `search_interaction`
    - Includes: `queryLengthBucket`, `resultCountBucket`, `sourceId`
  - `dwell_time_per_section`
    - Includes: `sectionId`, `durationBucket`
  - `return_intent`
    - Includes: `action`
  - `cta_visibility`
    - Includes: `ctaId`, `ctaVariant`, `sectionId`
  - `nav_path_cluster`
    - Includes: `cluster`
  - `form_error_type`
    - Includes: `errorType`, `fieldType`
  - `media_watch_progress`
    - Includes: `mediaType`, `progress`
  - `network_quality_impact`
    - Includes: `step`, `connectionType`
  - `engagement_score_bucket`
    - Includes: `bucket`
  - `error_recovery`
    - Includes: `status`
  - `reservation_lead_time_bucket`
    - Includes: `bucket`
  - `content_interaction`
    - Includes: `sectionId`, `contentId`, `interactionType`
  - `funnel_step`
    - Includes: `step`, `ctaId`, `ctaVariant`
  - `experiment_exposure`
    - Includes: `experimentId`, `variantId`

Automatic attribute-based capture (analytics consent required):

- Add `data-funnel-step`, optional `data-cta-id`, `data-cta-variant` to clickable elements for `funnel_step`.
- Add `data-content-section`, `data-content-id`, optional `data-content-interaction` for `content_interaction`.
- Add `data-experiment-id` and `data-variant-id` for `experiment_exposure`.

Consent categories are managed in the in-app consent gate. Users can accept all, reject optional tracking, or save a custom selection, and can reopen settings via **Manage consent**.

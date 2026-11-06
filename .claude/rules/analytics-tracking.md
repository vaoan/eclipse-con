---
paths:
  - "apps/*/src/components/**"
  - "apps/*/src/sections/**"
  - "apps/*/src/features/analytics/**"
  - "apps/moonfest2026/src/features/*/presentation/**"
---

# Analytics Tracking

Loaded when a component that can hold a clickable element is read. Each line is the rule; the link is the full text.

- **Every clickable element (button, link, anchor, trigger) carries analytics data attributes**, disabled ones included, so attempted interactions are measured. → `docs/lessons/analytics-tracking.md` (Every Interactive Element Must Be Tracked)
- **Links and anchors get `data-content-section` + `data-content-id`; CTA buttons add `data-cta-id`; funnel actions add `data-funnel-step`; open/expand/toggle elements add `data-content-interaction`.** Content cards carry the pair on the container. → `docs/lessons/analytics-tracking.md` (Required Data Attributes, Minimum Tracking)
- **News controls use `data-news-action`, plus `data-news-item-id` when it applies.** → `docs/lessons/analytics-tracking.md` (Minimum Tracking)
- **Keep `data-content-section` equal to the section the element sits in, and `data-content-id` unique** (`registration_reserve`). → `docs/lessons/analytics-tracking.md` (Before Committing)
- **A new Sunfest section also gets `data-content-section` and `data-testid={tid("[name]")}` on its root**; sections with no interactive element are tracked for visibility and dwell automatically. → `docs/lessons/project-overview.md` (Adding a Section to Sunfest 2027)
- **Interactions that need code call `trackContentInteraction()`, `trackFunnelStep()`, or the tutorial trackers** (`trackTutorialStepSelected`, `trackTutorialStepToggled`, `trackTutorialProgressBucket`). → `docs/lessons/analytics-tracking.md` (Programmatic Tracking)

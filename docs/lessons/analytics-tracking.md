# Analytics Tracking

## Every Interactive Element Must Be Tracked

All clickable elements (buttons, links, anchors, triggers) must have analytics data attributes. No interactive element should be added without tracking.

## Required Data Attributes

| Attribute                  | When to use                      | Example                                    |
| -------------------------- | -------------------------------- | ------------------------------------------ |
| `data-content-section`     | Every interactive element        | `"registration"`, `"news"`, `"navigation"` |
| `data-content-id`          | Every interactive element        | `"registration_reserve"`, `"guest_luna"`   |
| `data-content-interaction` | Elements that open/expand/toggle | `"open"`, `"expand"`, `"collapse"`         |
| `data-cta-id`              | Call-to-action buttons and links | `"hero_primary_cta"`, `"nav_logo"`         |
| `data-cta-variant`         | CTAs with multiple variants      | `"primary"`, `"secondary"`                 |
| `data-funnel-step`         | Conversion funnel actions        | `"click_reserve"`, `"start_checkout"`      |
| `data-news-action`         | News section interactions        | `"zoom_open"`, `"carousel_next"`           |

## Minimum Tracking Per Element Type

- **Links/Anchors**: `data-content-section` + `data-content-id`
- **CTA Buttons**: `data-content-section` + `data-content-id` + `data-cta-id`
- **Funnel Actions**: All CTA attributes + `data-funnel-step`
- **News Controls**: `data-news-action` + `data-news-item-id` (when applicable)
- **Content Cards**: `data-content-section` + `data-content-id` on the card container

## Programmatic Tracking

Some interactions use custom event dispatchers instead of (or in addition to) data attributes:

- `trackTutorialStepSelected()` — tutorial step navigation
- `trackTutorialStepToggled()` — tutorial step completion toggle
- `trackTutorialProgressBucket()` — tutorial progress milestones
- `trackContentInteraction()` — explicit content interaction events
- `trackFunnelStep()` — funnel step completion events

## Before Committing

When adding or modifying any component with interactive elements:

1. Verify every `<a>`, `<button>`, `<Button>`, `<Link>`, or clickable trigger has tracking attributes.
2. Use consistent `data-content-section` values that match the section the element belongs to.
3. Use descriptive `data-content-id` values that uniquely identify the element.
4. Disabled elements should still have tracking attributes (to measure attempted interactions).
5. Sections without interactive elements are auto-tracked for visibility and dwell time via section IDs.

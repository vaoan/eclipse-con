import { describe, expect, it } from "vitest";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

const REQUIRED = [
  "teaser.scrollCue",
  "teaser.bannerAlt",
  "about.eyebrow",
  "about.title",
  "about.body",
  "showcase.eyebrow",
  "showcase.title",
  "showcase.body",
  "showcase.roomsHeading",
  "showcase.openItem",
  "showcase.items.giantPool.alt",
  "showcase.items.giantPool.title",
  "showcase.items.giantPool.blurb",
  "showcase.items.suite.title",
  "showcase.items.poolside.title",
  "showcase.items.spa.blurb",
  "showcase.items.landscape.title",
  "footer.rights",
  "lightbox.label",
  "lightbox.close",
  "lightbox.prev",
  "lightbox.next",
  "lightbox.counter",
  "amenities.eyebrow",
  "amenities.title",
  "amenities.moreHeading",
  "amenities.more.kidsPool",
  "amenities.more.wifi",
  "cta.eyebrow",
  "cta.title",
  "cta.body",
];

/** Resolve a dot path like "venue.photos.pool.alt" against a locale object. */
function get(object: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (accumulator, k) => (accumulator as Record<string, unknown>)[k],
      object
    );
}

describe.each([
  ["es", es],
  ["en", en],
])("%s copy", (_name, dict) => {
  it.each(REQUIRED)("has a non-empty string at %s", (path) => {
    const value = get(dict, path);
    expect(typeof value).toBe("string");
    expect((value as string).length).toBeGreaterThan(0);
  });
});

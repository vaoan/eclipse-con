import { geoNaturalEarth1, geoPath } from "d3-geo";
import countries from "i18n-iso-countries";
import { useMemo, type CSSProperties } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldTopology from "world-atlas/countries-110m.json";
import { useTranslation } from "@/i18n";
import { countryName, formatCount } from "@/lib/format";
import { tid } from "@/lib/tid";
import { useElementWidth } from "@/lib/useElementWidth";

interface WorldMapProps {
  /** Clicks keyed by ISO alpha-2 country code. */
  readonly counts: Readonly<Record<string, number>>;
}

const topology = worldTopology as unknown as Topology<{
  countries: GeometryCollection;
}>;
const shapes = feature(topology, topology.objects.countries).features;
/** Tallest the map gets, in px. */
const MAX_HEIGHT = 380;

/**
 * Choropleth of clicks per country: one hue, light → dark, lightest receding
 * into the surface; a country without clicks stays neutral. Each country has
 * a native tooltip; the "Countries" breakdown beside it is the table view.
 * Loaded lazily so the ~100 KB of borders stay out of the first paint.
 */
export function WorldMap({ counts }: Readonly<WorldMapProps>) {
  const { t, i18n } = useTranslation();
  const [frameRef, width] = useElementWidth<HTMLDivElement>(720);
  // Natural Earth is ~2:1; cap the height so a wide screen isn't all ocean.
  const height = Math.min(Math.round(width * 0.5), MAX_HEIGHT);
  const max = Math.max(1, ...Object.values(counts));

  const paths = useMemo(() => {
    const projection = geoNaturalEarth1().fitSize([width, height], {
      type: "FeatureCollection",
      features: shapes,
    });
    const draw = geoPath(projection);
    // A few disputed areas (Kosovo, N. Cyprus…) carry no numeric id.
    return shapes.map((shape, index) => ({
      id: shape.id === undefined ? `shape-${String(index)}` : String(shape.id),
      code:
        shape.id === undefined
          ? ""
          : (countries.numericToAlpha2(String(shape.id)) ?? ""),
      d: draw(shape) ?? "",
    }));
  }, [width, height]);

  return (
    <section
      className="card card-wide"
      data-content-section="stats"
      data-testid={tid("world-map")}
    >
      <h3 className="card-title">{t("map.title")}</h3>
      <div className="chart-frame" ref={frameRef}>
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={t("map.title")}
        >
          {paths.map((country) => {
            const count = counts[country.code] ?? 0;
            const label = t("map.country", {
              name: country.code
                ? countryName(country.code, i18n.language)
                : "—",
              count: formatCount(count, i18n.language),
            });
            return (
              <path
                key={country.id}
                d={country.d}
                className={count > 0 ? "country has-clicks" : "country"}
                style={
                  {
                    "--heat": `${String(Math.round(15 + (count / max) * 85))}%`,
                  } as CSSProperties
                }
              >
                <title>{label}</title>
              </path>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

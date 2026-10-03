import { useTranslation } from "@/i18n";
import { formatCount } from "@/lib/format";
import { tid } from "@/lib/tid";
import type { Counts } from "@/types";

interface StatTilesProps {
  readonly totals: Counts;
  readonly includeBots: boolean;
}

/**
 * The range's headline numbers as stat tiles: clicks (the hero), unique
 * visitors, times shared (link-preview fetches) and bots.
 */
export function StatTiles({ totals, includeBots }: Readonly<StatTilesProps>) {
  const { t, i18n } = useTranslation();
  const clicks =
    totals.clicks + (includeBots ? totals.bots + totals.previews : 0);
  const tiles = [
    { id: "clicks", value: clicks },
    { id: "uniques", value: totals.uniques },
    { id: "shares", value: totals.previews },
    { id: "bots", value: totals.bots },
  ] as const;
  return (
    <dl
      className="tiles"
      data-content-section="stats"
      data-testid={tid("stat-tiles")}
    >
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className={tile.id === "clicks" ? "tile tile-hero" : "tile"}
        >
          <dt className="tile-label">{t(`tiles.${tile.id}`)}</dt>
          <dd className="tile-value">
            {formatCount(tile.value, i18n.language)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

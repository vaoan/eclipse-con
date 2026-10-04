import { useState } from "react";
import { useTranslation } from "@/i18n";
import { formatCount } from "@/lib/format";
import { tid } from "@/lib/tid";

/** One labelled value in a breakdown. */
export interface BarItem {
  readonly key: string;
  readonly label: string;
  readonly count: number;
  readonly uniques: number;
}

interface BarListProps {
  readonly id: string;
  readonly title: string;
  readonly items: readonly BarItem[];
  readonly hint?: string;
}

/** Rows shown before "show all". */
const COLLAPSED_ROWS = 8;

/**
 * A breakdown (countries, browsers, referrers…) as a table of thin
 * horizontal bars in one color with the value at the tip: the chart and its
 * table view are the same element, so nothing hides behind hover.
 */
export function BarList({ id, title, items, hint }: Readonly<BarListProps>) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const max = Math.max(1, ...items.map((item) => item.count));
  const visible = expanded ? items : items.slice(0, COLLAPSED_ROWS);

  return (
    <section
      className="card"
      data-content-section="stats"
      data-testid={tid(`breakdown-${id}`)}
    >
      <h3 className="card-title">{title}</h3>
      {hint ? <p className="muted small">{hint}</p> : null}
      {items.length === 0 ? (
        <p className="muted">{t("breakdown.empty")}</p>
      ) : (
        <table className="bar-table">
          <caption className="visually-hidden">{title}</caption>
          <thead className="visually-hidden">
            <tr>
              <th scope="col">{t("breakdown.value")}</th>
              <th scope="col">{t("breakdown.count")}</th>
              <th scope="col">{t("breakdown.uniques")}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.key}>
                <th scope="row" className="bar-label">
                  <span className="bar-name" title={item.label}>
                    {item.label}
                  </span>
                  <span className="bar-track" aria-hidden="true">
                    <span
                      className="bar series-1"
                      style={{ width: `${(item.count / max) * 100}%` }}
                    />
                  </span>
                </th>
                <td className="numeric strong">
                  {formatCount(item.count, i18n.language)}
                </td>
                <td className="numeric muted">
                  {formatCount(item.uniques, i18n.language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {items.length > COLLAPSED_ROWS ? (
        <button
          type="button"
          className="ghost-button"
          aria-expanded={expanded}
          onClick={() => {
            setExpanded((value) => !value);
          }}
          data-content-section="stats"
          data-content-id={`breakdown_${id}_expand`}
          data-content-interaction={expanded ? "collapse" : "expand"}
        >
          {expanded ? "−" : `+${String(items.length - COLLAPSED_ROWS)}`}
        </button>
      ) : null}
    </section>
  );
}

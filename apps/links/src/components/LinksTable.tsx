import { useMemo, useState } from "react";
import { LinkRowView } from "@/components/LinkRowView";
import { useTranslation } from "@/i18n";
import { eachDay } from "@/lib/range";
import { tid } from "@/lib/tid";
import type { LinksResponse, Scope } from "@/types";

interface LinksTableProps {
  readonly data: LinksResponse;
  readonly today: string;
  readonly scope: Scope;
  readonly onScope: (scope: Scope) => void;
}

const COLUMNS = [
  "link",
  "destination",
  "campaign",
  "clicks",
  "uniques",
  "trend",
  "lastClick",
  "actions",
] as const;

/**
 * Every short link with lifetime clicks and uniques, a 30-day sparkline and
 * the last click, filterable by a search box. Picking a slug or campaign
 * scopes the charts below to it. Links are edited in the Sheet, not here.
 */
export function LinksTable({
  data,
  today,
  scope,
  onScope,
}: Readonly<LinksTableProps>) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const trends = useMemo(() => {
    const days = eachDay(data.sparkline.since, today);
    const bySlug = new Map<string, Map<string, number>>();
    for (const row of data.sparkline.rows) {
      const perDay = bySlug.get(row.slug) ?? new Map<string, number>();
      perDay.set(row.date, row.clicks);
      bySlug.set(row.slug, perDay);
    }
    return (slug: string) => days.map((day) => bySlug.get(slug)?.get(day) ?? 0);
  }, [data.sparkline, today]);

  const needle = query.trim().toLowerCase();
  const links = data.links.filter((link) =>
    [link.slug, link.label ?? "", link.campaign ?? "", link.destination].some(
      (field) => field.toLowerCase().includes(needle)
    )
  );

  return (
    <section
      className="card card-wide"
      data-content-section="links"
      data-testid={tid("links-table")}
    >
      <header className="card-head">
        <h2 className="card-title">{t("links.title")}</h2>
        <input
          type="search"
          className="search"
          placeholder={t("links.search")}
          aria-label={t("links.search")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          data-content-section="links"
          data-content-id="links_search"
        />
      </header>
      <p className="muted small">{t("links.editHint")}</p>
      {data.links.length === 0 ? (
        <p className="muted">{t("links.empty")}</p>
      ) : null}
      {data.links.length > 0 && links.length === 0 ? (
        <p className="muted">{t("links.noMatch")}</p>
      ) : null}
      {links.length > 0 ? (
        <div className="table-scroll">
          <table className="data-table links">
            <caption className="visually-hidden">{t("links.title")}</caption>
            <thead>
              <tr>
                {COLUMNS.map((column) => (
                  <th key={column} scope="col">
                    {t(`links.columns.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <LinkRowView
                  key={link.slug}
                  link={link}
                  trend={trends(link.slug)}
                  scope={scope}
                  onScope={onScope}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

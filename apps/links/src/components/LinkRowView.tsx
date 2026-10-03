import { LinkActions } from "@/components/LinkActions";
import { Sparkline } from "@/components/Sparkline";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/cn";
import { formatCount, formatDateTime } from "@/lib/format";
import type { LinkRow, Scope } from "@/types";

interface LinkRowViewProps {
  readonly link: LinkRow;
  readonly trend: readonly number[];
  readonly scope: Scope;
  readonly onScope: (scope: Scope) => void;
}

/** One row of the links table. */
export function LinkRowView({
  link,
  trend,
  scope,
  onScope,
}: Readonly<LinkRowViewProps>) {
  const { t, i18n } = useTranslation();
  const selected = scope.kind === "slug" && scope.slug === link.slug;
  const trendTotal = trend.reduce((sum, value) => sum + value, 0);
  return (
    <tr className={cn(selected && "is-selected")}>
      <th scope="row">
        <button
          type="button"
          className="link-button slug"
          aria-pressed={selected}
          onClick={() => {
            onScope({ kind: "slug", slug: link.slug });
          }}
          data-content-section="links"
          data-content-id={`select_${link.slug}`}
          data-content-interaction="open"
        >
          fco.bz/{link.slug}
        </button>
        {link.label ? <div className="muted small">{link.label}</div> : null}
        {link.active === 1 ? null : (
          <span className="badge">{t("links.paused")}</span>
        )}
        {link.in_sheet === 1 ? null : (
          <span className="badge badge-warn">{t("links.missing")}</span>
        )}
      </th>
      <td className="destination">
        <a
          href={link.destination}
          target="_blank"
          rel="noreferrer"
          data-content-section="links"
          data-content-id={`destination_${link.slug}`}
        >
          {link.destination.replace(/^https:\/\//, "")}
        </a>
      </td>
      <td>
        {link.campaign ? (
          <button
            type="button"
            className="link-button"
            onClick={() => {
              onScope({ kind: "campaign", campaign: link.campaign ?? "" });
            }}
            data-content-section="links"
            data-content-id={`campaign_${link.campaign}`}
            data-content-interaction="open"
          >
            {link.campaign}
          </button>
        ) : null}
      </td>
      <td className="numeric strong">
        {formatCount(link.clicks, i18n.language)}
      </td>
      <td className="numeric">{formatCount(link.uniques, i18n.language)}</td>
      <td>
        <Sparkline
          values={trend}
          label={t("links.trendLabel", { count: trendTotal })}
        />
      </td>
      <td className="muted small">
        {link.last_click_at
          ? formatDateTime(link.last_click_at, i18n.language)
          : t("links.never")}
      </td>
      <td>
        <LinkActions slug={link.slug} />
      </td>
    </tr>
  );
}

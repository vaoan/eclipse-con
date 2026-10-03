import { useTranslation } from "@/i18n";
import { cn } from "@/lib/cn";
import { RANGE_PRESETS, type RangePreset } from "@/lib/range";
import { tid } from "@/lib/tid";

interface RangeFilterProps {
  readonly preset: RangePreset;
  readonly from: string;
  readonly to: string;
  readonly includeBots: boolean;
  readonly onPreset: (preset: RangePreset) => void;
  readonly onCustom: (from: string, to: string) => void;
  readonly onIncludeBots: (value: boolean) => void;
}

/**
 * The single filter row above every chart: date-range presets first, then a
 * custom from/to, then the bots-and-previews toggle. Scopes everything below.
 */
export function RangeFilter({
  preset,
  from,
  to,
  includeBots,
  onPreset,
  onCustom,
  onIncludeBots,
}: Readonly<RangeFilterProps>) {
  const { t } = useTranslation();
  return (
    <div
      className="filters"
      role="group"
      aria-label={t("filters.label")}
      data-testid={tid("filters")}
    >
      <div className="segmented">
        {RANGE_PRESETS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={preset === option}
            className={cn("segment", preset === option && "is-selected")}
            onClick={() => {
              onPreset(option);
            }}
            data-content-section="filters"
            data-content-id={`range_${option}`}
          >
            {t(`filters.presets.${option}`)}
          </button>
        ))}
      </div>
      <label className="date-field">
        <span>{t("filters.from")}</span>
        <input
          type="date"
          value={from}
          max={to}
          onChange={(event) => {
            onCustom(event.target.value, to);
          }}
          data-content-section="filters"
          data-content-id="range_custom_from"
        />
      </label>
      <label className="date-field">
        <span>{t("filters.to")}</span>
        <input
          type="date"
          value={to}
          min={from}
          onChange={(event) => {
            onCustom(from, event.target.value);
          }}
          data-content-section="filters"
          data-content-id="range_custom_to"
        />
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={includeBots}
          onChange={(event) => {
            onIncludeBots(event.target.checked);
          }}
          data-content-section="filters"
          data-content-id="include_bots"
          data-content-interaction="toggle"
        />
        <span>{t("filters.includeBots")}</span>
      </label>
    </div>
  );
}

import { useState } from "react";
import { Header } from "@/components/Header";
import { LinksTable } from "@/components/LinksTable";
import { MissesCard } from "@/components/MissesCard";
import { RangeFilter } from "@/components/RangeFilter";
import { ScopeBar } from "@/components/ScopeBar";
import { StatsView } from "@/components/StatsView";
import { SyncPanel } from "@/components/SyncPanel";
import { useTranslation } from "@/i18n";
import { ApiError, fetchLinks, fetchMe, fetchSync } from "@/lib/api";
import { bogotaDate, presetRange, type RangePreset } from "@/lib/range";
import { useApi } from "@/lib/useApi";
import type { Scope } from "@/types";

/** True when an error means the Access session is gone. */
function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

/**
 * The admin.fco.bz dashboard: header, links table and sync health, then one
 * filter row scoping the stats below it (tiles, time series, heatmap, map,
 * breakdowns, CSV export).
 */
export function App() {
  const { t } = useTranslation();
  const [now] = useState(() => Date.now());
  const [preset, setPreset] = useState<RangePreset>("30d");
  const [custom, setCustom] = useState(() => presetRange("30d", now));
  const [includeBots, setIncludeBots] = useState(false);
  const [scope, setScope] = useState<Scope>({ kind: "all" });

  const me = useApi(fetchMe, "me");
  const links = useApi(fetchLinks, "links");
  const sync = useApi(fetchSync, "sync");

  const range = preset === "custom" ? custom : presetRange(preset, now);
  const refreshAll = () => {
    links.reload();
    sync.reload();
  };

  if (
    [me.error, links.error, sync.error].some((error) => isUnauthorized(error))
  ) {
    return (
      <main className="page">
        <p role="alert">{t("state.unauthorized")}</p>
      </main>
    );
  }

  return (
    <>
      <Header me={me.data} />
      <main className="page">
        <div className="overview">
          {links.data ? (
            <LinksTable
              data={links.data}
              today={bogotaDate(now)}
              scope={scope}
              onScope={setScope}
            />
          ) : (
            <p className="muted">
              {links.error ? t("state.error") : t("state.loading")}
            </p>
          )}
          <div className="side">
            {sync.data ? (
              <SyncPanel data={sync.data} onSynced={refreshAll} />
            ) : null}
            {links.data ? <MissesCard misses={links.data.misses} /> : null}
          </div>
        </div>
        <RangeFilter
          preset={preset}
          from={range.from}
          to={range.to}
          includeBots={includeBots}
          onPreset={setPreset}
          onCustom={(from, to) => {
            setCustom({ from, to });
            setPreset("custom");
          }}
          onIncludeBots={setIncludeBots}
        />
        <ScopeBar
          scope={scope}
          onReset={() => {
            setScope({ kind: "all" });
          }}
        />
        <StatsView
          scope={scope}
          from={range.from}
          to={range.to}
          preset={preset}
          includeBots={includeBots}
          now={now}
        />
      </main>
    </>
  );
}

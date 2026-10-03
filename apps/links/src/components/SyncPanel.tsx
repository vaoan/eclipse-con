import { useState } from "react";
import { useTranslation } from "@/i18n";
import { syncNow } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { tid } from "@/lib/tid";
import type { RowError, SyncResponse } from "@/types";

interface SyncPanelProps {
  readonly data: SyncResponse;
  /** Called after a manual sync so links and status refresh. */
  readonly onSynced: () => void;
}

/** Parse the stored JSON list of rejected rows; tolerate junk. */
function parseErrors(raw: string | null | undefined): RowError[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RowError[]) : [];
  } catch {
    return [];
  }
}

/**
 * Health of the Sheet → links sync: last run and result, rows the sync
 * rejected (with the reason it wrote into the Sheet), links deleted from the
 * Sheet that keep working, when stats were last rolled up, and "Sync now".
 */
export function SyncPanel({ data, onSynced }: Readonly<SyncPanelProps>) {
  const { t, i18n } = useTranslation();
  const [running, setRunning] = useState(false);
  const state = data.state;
  const errors = parseErrors(state?.errors);

  let status = t("sync.never");
  if (state?.message === "not_configured") {
    status = t("sync.notConfigured");
  } else if (state?.ran_at) {
    const outcome =
      state.ok === 1
        ? t("sync.ok")
        : t("sync.failed", { message: state.message ?? "" });
    status = `${t("sync.lastRun", { time: formatDateTime(state.ran_at, i18n.language) })} · ${outcome}`;
  }

  const runNow = () => {
    setRunning(true);
    void syncNow()
      .catch((error: unknown) => {
        console.error(error);
      })
      .finally(() => {
        setRunning(false);
        onSynced();
      });
  };

  return (
    <section
      className="card"
      data-content-section="sync"
      data-testid={tid("sync-panel")}
    >
      <header className="card-head">
        <h2 className="card-title">{t("sync.title")}</h2>
        <button
          type="button"
          className="button"
          disabled={running}
          onClick={runNow}
          data-content-section="sync"
          data-content-id="sync_now"
          data-cta-id="sync_now"
        >
          {running ? t("sync.running") : t("sync.now")}
        </button>
      </header>
      <p role="status">{status}</p>
      {data.statsUpdatedAt ? (
        <p className="muted small">
          {t("sync.statsUpdated", {
            time: formatDateTime(data.statsUpdatedAt, i18n.language),
          })}
        </p>
      ) : null}
      {errors.length > 0 ? (
        <>
          <h3 className="subhead">{t("sync.errors")}</h3>
          <ul className="plain-list">
            {errors.map((error) => (
              <li key={`${String(error.row)}-${error.slug}`}>
                <strong>{t("sync.row", { row: error.row })}</strong> ·{" "}
                {error.slug || "—"} · {error.reason}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {data.missing.length > 0 ? (
        <>
          <h3 className="subhead">{t("sync.missing")}</h3>
          <ul className="plain-list">
            {data.missing.map((link) => (
              <li key={link.slug}>
                fco.bz/{link.slug} → {link.destination}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

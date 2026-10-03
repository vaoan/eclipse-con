import { useState } from "react";
import { useTranslation } from "@/i18n";
import { exportCsv } from "@/lib/api";
import { saveBlob } from "@/lib/download";

interface ExportButtonProps {
  readonly from: string;
  readonly to: string;
}

/**
 * Downloads every raw click in the range as one CSV (all links). This is also
 * the manual backup: the file opens in Excel or Google Sheets.
 */
export function ExportButton({ from, to }: Readonly<ExportButtonProps>) {
  const { t } = useTranslation();
  const [state, setState] = useState<"idle" | "running" | "failed">("idle");
  const run = () => {
    setState("running");
    exportCsv(from, to)
      .then((csv) => {
        saveBlob(
          new Blob([csv], { type: "text/csv" }),
          `fco-clicks-${from}_${to}.csv`
        );
        setState("idle");
      })
      .catch((error: unknown) => {
        console.error(error);
        setState("failed");
      });
  };
  return (
    <div className="export">
      <button
        type="button"
        className="button"
        disabled={state === "running"}
        onClick={run}
        data-content-section="stats"
        data-content-id="export_csv"
        data-cta-id="export_csv"
      >
        {state === "running" ? t("export.running") : t("export.button")}
      </button>
      {state === "failed" ? (
        <span role="alert" className="muted small">
          {t("export.failed")}
        </span>
      ) : null}
    </div>
  );
}

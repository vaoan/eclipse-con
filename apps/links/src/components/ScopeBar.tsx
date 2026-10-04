import { useTranslation } from "@/i18n";
import type { Scope } from "@/types";

interface ScopeBarProps {
  readonly scope: Scope;
  readonly onReset: () => void;
}

/** Names what the charts are showing, with a way back to all links. */
export function ScopeBar({ scope, onReset }: Readonly<ScopeBarProps>) {
  const { t } = useTranslation();
  let title = t("scope.all");
  if (scope.kind === "slug") {
    title = t("scope.link", { slug: scope.slug });
  } else if (scope.kind === "campaign") {
    title = t("scope.campaign", { campaign: scope.campaign });
  }
  return (
    <div className="scope-bar">
      <h2 className="scope-title">{title}</h2>
      {scope.kind === "all" ? null : (
        <button
          type="button"
          className="ghost-button"
          onClick={onReset}
          data-content-section="stats"
          data-content-id="scope_reset"
        >
          {t("scope.back")}
        </button>
      )}
    </div>
  );
}

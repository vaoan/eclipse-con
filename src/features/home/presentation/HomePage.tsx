import { useTranslation } from "react-i18next";

import { tid } from "@/shared/application/utils/tid";

export function Component() {
  const { t } = useTranslation();

  return (
    <div {...tid("home-page")}>
      <h1 className="text-4xl font-bold">{t("home.title")}</h1>
      <p className="mt-4 text-muted-foreground">{t("home.description")}</p>
    </div>
  );
}

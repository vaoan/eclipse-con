import { useTranslation } from "react-i18next";
import { FollowCta } from "@/components/FollowCta";
import { tid } from "@/lib/tid";

/** Single-screen sunfest2027 coming-soon teaser. */
export function App() {
  const { t } = useTranslation();
  return (
    <main
      data-testid={tid("teaser-root")}
      className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gradient-to-b from-sun-bg to-sun-glow/40 px-6 text-center text-sun-ink"
    >
      <h1 className="text-5xl font-extrabold tracking-tight text-sun-deep md:text-7xl">
        {t("teaser.wordmark")}
      </h1>
      <p className="text-2xl font-semibold md:text-3xl">
        {t("teaser.saveTheDate")}
      </p>
      <p className="max-w-md text-base opacity-80 md:text-lg">
        {t("teaser.subline")}
      </p>
      <FollowCta className="mt-2" />
      <footer className="mt-10 text-sm opacity-70">{t("teaser.footer")}</footer>
    </main>
  );
}

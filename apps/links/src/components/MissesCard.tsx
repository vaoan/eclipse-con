import { BarList } from "@/components/BarList";
import { useTranslation } from "@/i18n";

interface MissesCardProps {
  readonly misses: readonly { slug: string; clicks: number }[];
}

/**
 * Slugs people typed that don't exist (last 30 days) — usually a typo on a
 * flyer or in a post. Hidden when there are none.
 */
export function MissesCard({ misses }: Readonly<MissesCardProps>) {
  const { t } = useTranslation();
  if (misses.length === 0) {
    return null;
  }
  return (
    <BarList
      id="misses"
      title={t("misses.title")}
      hint={t("misses.hint")}
      items={misses.map((miss) => ({
        key: miss.slug,
        label: `fco.bz/${miss.slug}`,
        count: miss.clicks,
        uniques: 0,
      }))}
    />
  );
}

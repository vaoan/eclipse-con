import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { Globe } from "lucide-react";

import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";
import { WavePattern } from "../components/WavePattern";

const BRAND_ICON_COLOR = "e8e4df";

type LinkIcon =
  | { type: "brand"; slug: string }
  | { type: "lucide"; component: LucideIcon };

const COMMUNITY_LINKS: {
  label: string;
  href: string;
  icon: LinkIcon;
}[] = [
  {
    label: "Website",
    href: "https://moonfest-b63fa.web.app/",
    icon: { type: "lucide", component: Globe },
  },
  {
    label: "Carrd",
    href: "https://furrycolombia.carrd.co/",
    icon: { type: "brand", slug: "carrd" },
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/furry.colombia",
    icon: { type: "brand", slug: "facebook" },
  },
  {
    label: "X",
    href: "https://x.com/MoonfestCol",
    icon: { type: "brand", slug: "x" },
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/moonfest2026/",
    icon: { type: "brand", slug: "instagram" },
  },
  {
    label: "Discord",
    href: "https://discord.gg/ymPPhvd62D",
    icon: { type: "brand", slug: "discord" },
  },
  {
    label: "Facebook Group",
    href: "https://www.facebook.com/groups/FurryColombia",
    icon: { type: "brand", slug: "facebook" },
  },
  {
    label: "Telegram",
    href: "https://t.me/furrycolombia",
    icon: { type: "brand", slug: "telegram" },
  },
  {
    label: "Twitter",
    href: "https://twitter.com/FurryColombia",
    icon: { type: "brand", slug: "x" },
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/furrycolombia/",
    icon: { type: "brand", slug: "instagram" },
  },
  {
    label: "Fur Affinity",
    href: "https://www.furaffinity.net/user/furrycolombia/",
    icon: { type: "brand", slug: "furaffinity" },
  },
  {
    label: "Bluesky",
    href: "https://furrycolombia.bsky.app/",
    icon: { type: "brand", slug: "bluesky" },
  },
] as const;

export function FooterSection() {
  const { t } = useTranslation();
  const appVersion =
    (import.meta.env.VITE_APP_VERSION as string | undefined) ?? "dev";

  return (
    <footer className="relative bg-surface" {...tid("section-footer")}>
      <WavePattern className="rotate-180" />

      <div className="mx-auto max-w-6xl px-4 pb-8 pt-12">
        <div className="flex flex-col items-center gap-8 text-center">
          <h2 className="gold-shimmer-text font-display text-3xl font-bold">
            Moonfest 2026
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("convention.footer.tagline")}
          </p>

          <div className="mt-2 w-full max-w-4xl">
            <p className="text-sm font-semibold text-foreground">
              {t("convention.footer.communityTitle")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("convention.footer.communityHashtag")}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              {COMMUNITY_LINKS.map(({ icon, label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-white/10",
                    "px-3 py-1.5 transition-colors hover:border-accent/40 hover:text-accent"
                  )}
                  aria-label={label}
                  title={label}
                >
                  {icon.type === "brand" ? (
                    <img
                      src={`https://cdn.simpleicons.org/${icon.slug}/${BRAND_ICON_COLOR}?viewbox=auto`}
                      alt=""
                      className="h-3.5 w-3.5"
                      loading="lazy"
                    />
                  ) : (
                    <icon.component size={14} />
                  )}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-2 border-t border-white/5 pt-6">
            <p className="text-xs text-muted-foreground">
              {t("convention.footer.credits")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {t("convention.footer.copyright")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {t("convention.footer.version", { version: appVersion })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

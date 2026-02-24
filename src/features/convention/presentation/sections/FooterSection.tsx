import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { Globe } from "lucide-react";

import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";
import { WavePattern } from "../components/WavePattern";

type LinkIcon =
  | { type: "brand"; slug: string }
  | { type: "lucide"; component: LucideIcon };

const COMMUNITY_LINKS: {
  label: string;
  href: string;
  icon: LinkIcon;
  iconUrl?: string;
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
    iconUrl: "https://cdn.simpleicons.org/carrd/596cdf?viewbox=auto",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/furry.colombia",
    icon: { type: "brand", slug: "facebook" },
    iconUrl: "https://cdn.simpleicons.org/facebook/1877f2?viewbox=auto",
  },
  {
    label: "Discord",
    href: "https://discord.gg/ymPPhvd62D",
    icon: { type: "brand", slug: "discord" },
    iconUrl: "https://cdn.simpleicons.org/discord/5865f2?viewbox=auto",
  },
  {
    label: "Telegram",
    href: "https://t.me/furrycolombia",
    icon: { type: "brand", slug: "telegram" },
    iconUrl: "https://cdn.simpleicons.org/telegram/26a5e4?viewbox=auto",
  },
  {
    label: "Twitter",
    href: "https://twitter.com/FurryColombia",
    icon: { type: "brand", slug: "x" },
    iconUrl: "https://cdn.simpleicons.org/x/ffffff?viewbox=auto",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/furrycolombia/",
    icon: { type: "brand", slug: "instagram" },
    iconUrl: "https://cdn.simpleicons.org/instagram/ff4da6?viewbox=auto",
  },
  {
    label: "Fur Affinity",
    href: "https://www.furaffinity.net/user/furrycolombia/",
    icon: { type: "brand", slug: "furaffinity" },
    iconUrl: "https://cdn.simpleicons.org/furaffinity/ffffff?viewbox=auto",
  },
] as const;

export function FooterSection() {
  const { t } = useTranslation();
  const appVersion =
    (import.meta.env.VITE_APP_VERSION as string | undefined) ?? "dev";

  return (
    <footer
      className="relative overflow-hidden bg-surface"
      {...tid("section-footer")}
    >
      <WavePattern className="rotate-180 opacity-35" />
      <div className="relative border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-12">
          <div className="flex flex-col items-center text-center">
            <h2 className="gold-shimmer-text font-display text-3xl font-bold sm:text-4xl">
              Moonfest 2026
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {t("convention.footer.tagline")}
            </p>
            <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
              <span className="font-medium text-foreground/90">
                {t("convention.footer.communityTitle")}
              </span>{" "}
              <span className="text-accent">
                {t("convention.footer.communityHashtag")}
              </span>
            </p>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t("convention.footer.social")}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5 sm:gap-3">
              {COMMUNITY_LINKS.map(({ icon, label, href, iconUrl }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "group inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/18 bg-[#111840]/80 text-foreground",
                    "transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-[#182157]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/75 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  )}
                  aria-label={label}
                  title={label}
                >
                  {icon.type === "brand" ? (
                    <img
                      src={iconUrl ?? ""}
                      alt=""
                      className="h-[18px] w-[18px] opacity-100 transition-transform duration-200 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <icon.component
                      size={18}
                      className="text-foreground transition-transform duration-200 group-hover:scale-110"
                    />
                  )}
                  <span className="sr-only">{label}</span>
                </a>
              ))}
            </div>

            <div className="mt-6 space-y-1 text-center text-xs text-muted-foreground/75">
              <p>{t("convention.footer.credits")}</p>
              <p>{t("convention.footer.copyright")}</p>
              <p className="text-muted-foreground/65">
                {t("convention.footer.version", { version: appVersion })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

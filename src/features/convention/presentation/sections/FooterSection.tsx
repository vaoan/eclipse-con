import { useTranslation } from "react-i18next";
import { Globe, AtSign, MessageCircle } from "lucide-react";

import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";
import { WavePattern } from "../components/WavePattern";

const SOCIAL_LINKS = [
  { icon: Globe, label: "Website", href: "#" },
  { icon: AtSign, label: "Social", href: "#" },
  { icon: MessageCircle, label: "Discord", href: "#" },
] as const;

export function FooterSection() {
  const { t } = useTranslation();

  return (
    <footer className="relative bg-surface" {...tid("section-footer")}>
      <WavePattern className="rotate-180" />

      <div className="mx-auto max-w-6xl px-4 pb-8 pt-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="gold-shimmer-text font-display text-3xl font-bold">
            Eclipse Con
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("convention.footer.tagline")}
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  "border border-white/10 text-muted-foreground",
                  "transition-colors hover:border-accent/40 hover:text-accent"
                )}
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

          <div className="mt-4 border-t border-white/5 pt-6">
            <p className="text-xs text-muted-foreground">
              {t("convention.footer.credits")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {t("convention.footer.copyright")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

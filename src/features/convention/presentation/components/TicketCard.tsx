import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";
import { RESERVATION_URL } from "@/features/convention/domain/constants";
import type { TicketTier } from "@/features/convention/domain/types";

interface TicketCardProps {
  readonly tier: TicketTier;
}

export function TicketCard({ tier }: Readonly<TicketCardProps>) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-xl border p-6",
        "transition-all duration-300",
        tier.highlighted
          ? "border-accent/50 bg-surface-elevated shadow-lg shadow-accent/5"
          : "border-white/5 bg-surface hover:border-white/10"
      )}
      {...tid(`ticket-card-${tier.id}`)}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-accent-foreground">
          Popular
        </div>
      )}
      <h3 className="font-display text-xl font-bold text-foreground">
        {t(tier.nameKey)}
      </h3>
      <p className="mt-2 font-display text-4xl font-bold text-accent">
        {t(tier.priceKey)}
      </p>
      <ul className="mt-6 flex-1 space-y-3">
        {tier.featuresKeys.map((featureKey) => (
          <li
            key={featureKey}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Check size={16} className="shrink-0 text-primary" />
            <span>{t(featureKey)}</span>
          </li>
        ))}
      </ul>
      <a
        href={RESERVATION_URL}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-bold transition-colors",
          tier.highlighted
            ? "bg-accent text-accent-foreground hover:bg-accent-glow"
            : "bg-primary/15 text-primary hover:bg-primary/25"
        )}
      >
        {t("convention.registration.cta")}
      </a>
    </div>
  );
}

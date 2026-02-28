import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";
import { RESERVATION_URL } from "@/features/convention/domain/constants";
import type { TicketTier } from "@/features/convention/domain/types";

interface TicketCardProps {
  readonly tier: TicketTier;
}

/** Renders a registration ticket card with pricing, feature list, and a reservation CTA link. */
export function TicketCard({ tier }: Readonly<TicketCardProps>) {
  const { t } = useTranslation();

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col border transition-all duration-300",
        tier.highlighted
          ? "border-accent/50 bg-surface-elevated shadow-lg shadow-accent/10"
          : "border-white/5 bg-surface/90 hover:border-white/10"
      )}
      {...tid(`ticket-card-${tier.id}`)}
    >
      {tier.highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent-foreground">
          {t("convention.registration.popular")}
        </Badge>
      )}
      <CardHeader className="gap-2">
        <CardTitle className="font-display text-xl font-bold text-foreground">
          {t(tier.nameKey)}
        </CardTitle>
        <p className="font-display text-4xl font-bold text-accent">
          {t(tier.priceKey)}
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {tier.featuresKeys.map((featureKey) => (
            <li
              key={featureKey}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Check size={16} className="shrink-0 text-emerald-400" />
              <span>{t(featureKey)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          className={cn(
            "w-full",
            tier.highlighted
              ? "bg-accent text-accent-foreground hover:bg-accent-glow"
              : "bg-accent/90 text-accent-foreground hover:bg-accent"
          )}
        >
          <a
            href={RESERVATION_URL}
            target="_blank"
            rel="noreferrer"
            data-funnel-step="click_reserve"
            data-cta-id={`ticket_${tier.id}_reserve`}
            data-cta-variant={tier.id}
            data-content-section="registration"
            data-content-id={`ticket_${tier.id}`}
            data-content-interaction="open"
          >
            {t("convention.registration.cta")}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

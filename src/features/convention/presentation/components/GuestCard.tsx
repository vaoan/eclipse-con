import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";
import type { Guest } from "@/features/convention/domain/types";

interface GuestCardProps {
  readonly guest: Guest;
}

export function GuestCard({ guest }: Readonly<GuestCardProps>) {
  const { t } = useTranslation();

  return (
    <Card
      className={cn(
        "border-white/5 bg-surface/90 text-center transition-all duration-300 hover:border-accent/30 hover:bg-surface-elevated"
      )}
      {...tid(`guest-card-${guest.id}`)}
    >
      <CardHeader className="items-center gap-3 border-b border-white/5 pb-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/30">
          <span className="font-display text-2xl font-bold text-primary">
            {guest.initials}
          </span>
        </div>
        <CardTitle className="font-display text-lg font-bold text-foreground">
          {t(guest.nameKey)}
        </CardTitle>
        <p className="text-sm font-medium text-accent">{t(guest.roleKey)}</p>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t(guest.bioKey)}
        </p>
      </CardContent>
    </Card>
  );
}

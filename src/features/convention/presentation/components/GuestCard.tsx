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
        "group relative overflow-hidden border-white/10 bg-surface/80 pb-6 py-0 text-left shadow-[0_18px_45px_-30px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-surface-elevated"
      )}
      {...tid(`guest-card-${guest.id}`)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-60" />
      <div className="relative">
        <div className="relative h-60 w-full overflow-hidden rounded-t-3xl bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%),linear-gradient(135deg,rgba(59,130,246,0.22),rgba(15,23,42,0.94))]">
          <img
            src={guest.imageSrc}
            alt={t(guest.nameKey)}
            className="absolute inset-0 h-full w-full object-contain p-6 drop-shadow-[0_22px_45px_rgba(8,10,20,0.55)]"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <CardHeader className="relative gap-3 border-b border-white/10 pb-4 pt-5">
        <CardTitle className="font-display text-xl font-semibold text-foreground">
          {t(guest.nameKey)}
        </CardTitle>
        <p className="text-sm font-medium text-amber-300">{t(guest.roleKey)}</p>
      </CardHeader>
      <CardContent className="relative pb-6 pt-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t(guest.bioKey)}
        </p>
      </CardContent>
    </Card>
  );
}

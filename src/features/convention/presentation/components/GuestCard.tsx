import { useTranslation } from "react-i18next";

import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";
import type { Guest } from "@/features/convention/domain/types";

interface GuestCardProps {
  readonly guest: Guest;
}

export function GuestCard({ guest }: Readonly<GuestCardProps>) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "rounded-xl border border-white/5 bg-surface p-6 text-center",
        "transition-all duration-300 hover:border-accent/30 hover:bg-surface-elevated"
      )}
      {...tid(`guest-card-${guest.id}`)}
    >
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/30">
        <span className="font-display text-2xl font-bold text-primary">
          {guest.initials}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold text-foreground">
        {t(guest.nameKey)}
      </h3>
      <p className="mt-1 text-sm font-medium text-accent">{t(guest.roleKey)}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {t(guest.bioKey)}
      </p>
    </div>
  );
}

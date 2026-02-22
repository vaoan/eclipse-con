import { useTranslation } from "react-i18next";
import {
  MessageSquare,
  Paintbrush,
  Music,
  Palette,
  Star,
  ShoppingBag,
} from "lucide-react";

import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";
import type { ConventionEvent } from "@/features/convention/domain/types";

const ICON_MAP: Record<string, React.ElementType> = {
  MessageSquare,
  Paintbrush,
  Music,
  Palette,
  Star,
  ShoppingBag,
};

interface EventCardProps {
  readonly event: ConventionEvent;
}

export function EventCard({ event }: Readonly<EventCardProps>) {
  const { t } = useTranslation();
  const Icon = ICON_MAP[event.icon] ?? Star;

  return (
    <div
      className={cn(
        "group rounded-xl border border-white/5 bg-surface p-6",
        "transition-all duration-300 hover:border-accent/30 hover:bg-surface-elevated"
      )}
      {...tid(`event-card-${event.id}`)}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        <Icon size={24} />
      </div>
      <h3 className="font-display mb-2 text-lg font-bold text-foreground">
        {t(event.titleKey)}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t(event.descriptionKey)}
      </p>
    </div>
  );
}

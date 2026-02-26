import { useTranslation } from "react-i18next";

import { SectionWrapper } from "../components/SectionWrapper";

interface SectionGroupIntroProps {
  readonly id: string;
  readonly titleKey: string;
  readonly subtitleKey: string;
  readonly descriptionKey: string;
  readonly accent: "accent" | "primary" | "gold" | "red" | "green";
  readonly noteKey?: string;
}

const ACCENT_STYLES = {
  primary: {
    ring: "from-primary/25 via-primary/5 to-transparent",
    text: "text-primary",
    highlight: "bg-primary/15 text-primary",
  },
  accent: {
    ring: "from-accent/25 via-accent/5 to-transparent",
    text: "text-accent",
    highlight: "bg-accent/15 text-accent",
  },
  gold: {
    ring: "from-amber-400/30 via-amber-300/10 to-transparent",
    text: "text-amber-300",
    highlight: "bg-amber-400/15 text-amber-200",
  },
  red: {
    ring: "from-rose-500/30 via-rose-400/10 to-transparent",
    text: "text-rose-300",
    highlight: "bg-rose-500/15 text-rose-200",
  },
  green: {
    ring: "from-emerald-400/30 via-emerald-300/10 to-transparent",
    text: "text-emerald-300",
    highlight: "bg-emerald-400/15 text-emerald-200",
  },
} as const;

export function SectionGroupIntro({
  id,
  titleKey,
  subtitleKey,
  descriptionKey,
  accent,
  noteKey,
}: Readonly<SectionGroupIntroProps>) {
  const { t } = useTranslation();
  const accentStyle = ACCENT_STYLES[accent];
  const subtitle = t(subtitleKey);

  return (
    <SectionWrapper
      id={id}
      surfaceTone="deep"
      className="py-16 md:py-20"
      decorations={
        <div
          className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-from),_transparent_60%)] ${accentStyle.ring}`}
        />
      }
    >
      <div className="rounded-3xl border border-white/10 bg-surface/70 p-8 shadow-[0_24px_60px_-40px_rgba(8,10,20,0.9)] md:p-10">
        {subtitle ? (
          <p className="text-xs font-semibold uppercase tracking-[0.4em]">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 ${accentStyle.highlight}`}
            >
              {subtitle}
            </span>
          </p>
        ) : null}
        <h2 className="mt-3 font-display text-3xl font-semibold text-foreground md:text-4xl">
          {t(titleKey)}
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-foreground/70 md:text-base">
          {t(descriptionKey)}
        </p>
        {noteKey ? (
          <div
            className={`mt-5 inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${accentStyle.highlight}`}
          >
            {t(noteKey)}
          </div>
        ) : null}
      </div>
    </SectionWrapper>
  );
}

import { useTranslation } from "react-i18next";

import { SectionWrapper } from "../components/SectionWrapper";

interface SectionGroupIntroProps {
  readonly id: string;
  readonly titleKey: string;
  readonly subtitleKey: string;
  readonly descriptionKey: string;
  readonly accent: "accent" | "primary";
  readonly noteKey?: string;
}

export function SectionGroupIntro({
  id,
  titleKey,
  subtitleKey,
  descriptionKey,
  accent,
  noteKey,
}: Readonly<SectionGroupIntroProps>) {
  const { t } = useTranslation();
  const accentRing =
    accent === "primary"
      ? "from-primary/25 via-primary/5 to-transparent"
      : "from-accent/25 via-accent/5 to-transparent";
  const accentText = accent === "primary" ? "text-primary" : "text-accent";

  return (
    <SectionWrapper
      id={id}
      surfaceTone="deep"
      className="py-16 md:py-20"
      decorations={
        <div
          className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-from),_transparent_60%)] ${accentRing}`}
        />
      }
    >
      <div className="rounded-3xl border border-white/10 bg-surface/70 p-8 shadow-[0_24px_60px_-40px_rgba(8,10,20,0.9)] md:p-10">
        <p
          className={`text-xs font-semibold uppercase tracking-[0.4em] ${accentText}`}
        >
          {t(subtitleKey)}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-foreground md:text-4xl">
          {t(titleKey)}
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-foreground/70 md:text-base">
          {t(descriptionKey)}
        </p>
        {noteKey ? (
          <div className="mt-5 inline-flex items-center rounded-full border border-white/10 bg-surface/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">
            {t(noteKey)}
          </div>
        ) : null}
      </div>
    </SectionWrapper>
  );
}

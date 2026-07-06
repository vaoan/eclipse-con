import type { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BadgeAlert, Info, ZoomIn } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/presentation/ui/button";
import {
  TICKET_URL_INTERNATIONAL,
  TICKET_URL_LOCAL,
} from "@/features/convention/domain/constants";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/presentation/ui/dialog";
import { tid } from "@/shared/application/utils/tid";
import { trackTutorialStepSelected } from "@/features/analytics/infrastructure/extremeTracking";
import type { StepNumber } from "@/features/registration-tutorial/domain/tutorialSteps";
import {
  LAST_STEP,
  STEPS,
  STEP_IMAGES,
} from "@/features/registration-tutorial/domain/tutorialSteps";
import { useTutorialStepState } from "@/features/registration-tutorial/application/useTutorialStepState";

interface ImageLightboxProps {
  readonly src: string;
  readonly alt: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

/** Full-screen lightbox dialog for viewing tutorial screenshots at full resolution. */
function ImageLightbox({ src, alt, open, onOpenChange }: ImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-[98vw] border-white/10 bg-background/95 p-1 backdrop-blur-sm sm:max-w-[96vw] sm:p-2"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <img
          src={src}
          alt={alt}
          className="h-auto max-h-[95vh] w-full rounded-lg object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}

interface TutorialStepsProps {
  readonly activeStep: StepNumber;
  readonly completedSteps: Record<StepNumber, boolean>;
  readonly onSelectStep: (step: StepNumber) => void;
  readonly t: TFunction;
}

/** Renders the five step selector cards in a responsive grid. */
function TutorialSteps({
  activeStep,
  completedSteps,
  onSelectStep,
  t,
}: TutorialStepsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {STEPS.map(({ number, Icon }) => {
        const stepKey = `convention.registrationTutorial.steps.step${number}`;
        const isActive = activeStep === number;
        const isDone = completedSteps[number];
        return (
          <button
            key={number}
            type="button"
            onClick={() => {
              trackTutorialStepSelected({
                stepNumber: number,
                origin: "step_card",
              });
              onSelectStep(number);
            }}
            className={`rounded-2xl border p-4 text-left transition ${isActive ? "border-accent/70 bg-surface/55" : "border-white/10 bg-surface/25 hover:border-accent/35"}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {t("convention.registrationTutorial.steps.label", { number })}
              </span>
              <Icon className="h-4 w-4 text-accent/80" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {t(`${stepKey}.title`)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {isDone
                ? t("convention.registrationTutorial.interactive.done")
                : t("convention.registrationTutorial.interactive.pending")}
            </p>
          </button>
        );
      })}
    </section>
  );
}

interface TutorialInteractivePanelProps {
  readonly activeStep: StepNumber;
  readonly completedSteps: Record<StepNumber, boolean>;
  readonly progress: number;
  readonly onToggleDone: (step: StepNumber) => void;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onZoomImage: () => void;
  readonly t: TFunction;
}

interface StepImagePreviewProps {
  readonly activeStep: StepNumber;
  readonly onZoomImage: () => void;
  readonly t: TFunction;
}

/** Zoomable step screenshot preview with hover hint. */
function StepImagePreview({
  activeStep,
  onZoomImage,
  t,
}: StepImagePreviewProps) {
  const activeStepKey = `convention.registrationTutorial.steps.step${activeStep}`;
  return (
    <div className="flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface/40 p-3">
      <button
        type="button"
        className="group relative flex w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-background/60"
        onClick={onZoomImage}
        aria-label={t("convention.registrationTutorial.interactive.zoomHint")}
        data-content-section="registration_tutorial"
        data-content-id={`tutorial_zoom_step_${activeStep}`}
        data-content-interaction="open"
      >
        <img
          src={STEP_IMAGES[activeStep]}
          alt={t(`${activeStepKey}.title`)}
          className="h-auto w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <span className="absolute right-2 bottom-2 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs text-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" />
          {t("convention.registrationTutorial.interactive.zoomHint")}
        </span>
      </button>
    </div>
  );
}

/** Interactive panel showing the step screenshot, description, progress bar, and navigation controls. */
function TutorialInteractivePanel({
  activeStep,
  completedSteps,
  progress,
  onToggleDone,
  onPrevious,
  onNext,
  onZoomImage,
  t,
}: TutorialInteractivePanelProps) {
  const activeStepKey = `convention.registrationTutorial.steps.step${activeStep}`;

  return (
    <section className="grid gap-5 rounded-2xl border border-white/10 bg-surface/20 p-5 md:grid-cols-[1.2fr_1fr] md:p-6">
      <StepImagePreview
        activeStep={activeStep}
        onZoomImage={onZoomImage}
        t={t}
      />
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-accent">
            {t("convention.registrationTutorial.interactive.title")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            {t(`${activeStepKey}.title`)}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(`${activeStepKey}.description`)}
          </p>
        </div>

        <ul className="space-y-2 text-sm text-foreground/80">
          <li>- {t(`${activeStepKey}.point1`)}</li>
          <li>- {t(`${activeStepKey}.point2`)}</li>
        </ul>

        <div className="rounded-xl border border-white/10 bg-background/60 p-3">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span>
              {t("convention.registrationTutorial.interactive.progress")}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            className="mt-3 w-full border border-white/10 text-xs uppercase tracking-[0.12em]"
            onClick={() => {
              onToggleDone(activeStep);
            }}
          >
            {completedSteps[activeStep]
              ? t("convention.registrationTutorial.interactive.markPending")
              : t("convention.registrationTutorial.interactive.markDone")}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-white/15"
            onClick={onPrevious}
            disabled={activeStep === 1}
          >
            {t("convention.registrationTutorial.interactive.previous")}
          </Button>
          <Button
            type="button"
            className="bg-accent text-accent-foreground hover:bg-accent-glow"
            onClick={onNext}
            disabled={activeStep === LAST_STEP}
          >
            {t("convention.registrationTutorial.interactive.next")}
          </Button>
        </div>
      </div>
    </section>
  );
}

/** Checklist section with important payment notes and quick summary items. */
function TutorialChecklist({ t }: Readonly<{ t: TFunction }>) {
  return (
    <section className="space-y-4">
      <div className="inline-flex items-start gap-3 rounded-2xl border border-amber-300/35 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{t("convention.registrationTutorial.paymentNote")}</p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-surface/20 p-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {t("convention.registrationTutorial.checklist.title")}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>- {t("convention.registrationTutorial.checklist.item1")}</li>
            <li>- {t("convention.registrationTutorial.checklist.item2")}</li>
            <li>- {t("convention.registrationTutorial.checklist.item3")}</li>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            asChild
            variant="glow"
            size="lg"
            data-content-section="registration_tutorial"
            data-content-id="tutorial_ticket_local"
            data-cta-id="tutorial_ticket_local"
            data-content-interaction="open"
          >
            <a
              href={TICKET_URL_LOCAL}
              target="_blank"
              rel="noopener noreferrer"
              {...tid("tutorial-ticket-cta-local")}
            >
              {t("convention.registrationTutorial.actions.ticketLocal")}
            </a>
          </Button>
          <Button
            asChild
            variant="glow"
            size="lg"
            data-content-section="registration_tutorial"
            data-content-id="tutorial_ticket_international"
            data-cta-id="tutorial_ticket_international"
            data-content-interaction="open"
          >
            <a
              href={TICKET_URL_INTERNATIONAL}
              target="_blank"
              rel="noopener noreferrer"
              {...tid("tutorial-ticket-cta-international")}
            >
              {t("convention.registrationTutorial.actions.ticketInternational")}
            </a>
          </Button>
          <p className="text-xs text-muted-foreground">
            {t("convention.registrationTutorial.actions.note")}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Placeholder section for Part 2 (ticket purchase), shown as coming soon. */
function Part2ComingSoon({ t }: Readonly<{ t: TFunction }>) {
  return (
    <section className="rounded-2xl border border-white/10 bg-surface/20 p-6 text-center">
      <h2 className="text-xl font-semibold text-foreground">
        {t("convention.registrationTutorial.part2Title")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("convention.registrationTutorial.part2Description")}
      </p>
    </section>
  );
}

/**
 * Five-step hotel booking tutorial page that guides users through the Estelar reservation process.
 * Exported as `Component` for React Router's `lazy` route loader.
 */
export function Component() {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const {
    activeStep,
    completedSteps,
    progress,
    goToNextStep,
    goToPreviousStep,
    setActiveStep,
    toggleStepDone,
  } = useTutorialStepState();

  const activeStepKey = `convention.registrationTutorial.steps.step${activeStep}`;

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
      {...tid("registration-tutorial-page")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.16),transparent_58%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="outline" className="border-white/15">
            <Link
              to="/?section=registration"
              data-content-section="registration_tutorial"
              data-content-id="back_to_registration"
              data-content-interaction="open"
              {...tid("tutorial-back-to-registration")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("convention.registrationTutorial.back")}
            </Link>
          </Button>
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/50">
            {t("convention.registrationTutorial.badge")}
          </p>
        </div>

        <header className="space-y-4">
          <h1 className="font-display text-3xl leading-tight text-foreground md:text-5xl">
            {t("convention.registrationTutorial.title")}
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
            {t("convention.registrationTutorial.subtitle")}
          </p>
          <div className="inline-flex items-start gap-3 rounded-2xl border border-amber-300/35 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            <BadgeAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{t("convention.registrationTutorial.warning")}</p>
          </div>
        </header>

        <h2 className="text-lg font-semibold uppercase tracking-[0.16em] text-accent">
          {t("convention.registrationTutorial.part1Title")}
        </h2>

        <TutorialSteps
          activeStep={activeStep}
          completedSteps={completedSteps}
          onSelectStep={setActiveStep}
          t={t}
        />
        <TutorialInteractivePanel
          activeStep={activeStep}
          completedSteps={completedSteps}
          progress={progress}
          onToggleDone={toggleStepDone}
          onPrevious={goToPreviousStep}
          onNext={goToNextStep}
          onZoomImage={() => {
            setLightboxOpen(true);
          }}
          t={t}
        />
        <TutorialChecklist t={t} />
        <Part2ComingSoon t={t} />
      </div>

      <ImageLightbox
        src={STEP_IMAGES[activeStep]}
        alt={t(`${activeStepKey}.title`)}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  );
}

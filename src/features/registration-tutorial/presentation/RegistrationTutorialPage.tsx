import type { TFunction } from "i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeAlert,
  CheckCircle2,
  Hotel,
  Ticket,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { tid } from "@/shared/application/utils/tid";
import {
  trackTutorialStepSelected,
  trackTutorialStepToggled,
  trackTutorialProgressBucket,
} from "@/features/analytics/infrastructure/extremeTracking";

const STEPS = [
  { number: 1, Icon: Hotel },
  { number: 2, Icon: Ticket },
  { number: 3, Icon: CheckCircle2 },
] as const;

type StepNumber = (typeof STEPS)[number]["number"];

const parseStepParameter = (value: string | null): StepNumber => {
  if (value === "1" || value === "2" || value === "3") {
    return Number(value) as StepNumber;
  }
  return 1;
};

function StepIllustration({ step }: Readonly<{ step: StepNumber }>) {
  if (step === 1) {
    return (
      <svg viewBox="0 0 360 220" className="h-full w-full" aria-hidden="true">
        <rect x="12" y="18" width="336" height="186" rx="18" fill="#171922" />
        <rect x="40" y="44" width="280" height="130" rx="12" fill="#232736" />
        <rect x="64" y="68" width="160" height="18" rx="9" fill="#c9a84c" />
        <rect x="64" y="98" width="230" height="12" rx="6" fill="#8b93a9" />
        <rect x="64" y="118" width="170" height="12" rx="6" fill="#6f768a" />
        <rect x="64" y="142" width="120" height="20" rx="10" fill="#d87a4d" />
      </svg>
    );
  }

  if (step === 2) {
    return (
      <svg viewBox="0 0 360 220" className="h-full w-full" aria-hidden="true">
        <rect x="12" y="18" width="336" height="186" rx="18" fill="#171922" />
        <rect x="44" y="46" width="272" height="126" rx="12" fill="#232736" />
        <rect x="66" y="70" width="142" height="16" rx="8" fill="#c9a84c" />
        <rect x="66" y="96" width="224" height="12" rx="6" fill="#8b93a9" />
        <rect x="66" y="116" width="204" height="12" rx="6" fill="#8b93a9" />
        <rect x="66" y="136" width="114" height="20" rx="10" fill="#4fa3d1" />
        <rect x="236" y="136" width="54" height="20" rx="10" fill="#2f3445" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 360 220" className="h-full w-full" aria-hidden="true">
      <rect x="12" y="18" width="336" height="186" rx="18" fill="#171922" />
      <rect x="44" y="46" width="272" height="126" rx="12" fill="#232736" />
      <circle cx="94" cy="92" r="24" fill="#c9a84c" />
      <path d="M84 92l8 8 14-16" stroke="#12141c" strokeWidth="4" fill="none" />
      <rect x="132" y="78" width="152" height="12" rx="6" fill="#8b93a9" />
      <rect x="132" y="100" width="132" height="12" rx="6" fill="#8b93a9" />
      <rect x="66" y="136" width="224" height="20" rx="10" fill="#3f8f5d" />
    </svg>
  );
}

const useTutorialStepState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState<StepNumber>(() =>
    parseStepParameter(searchParams.get("step"))
  );
  const [completedSteps, setCompletedSteps] = useState<
    Record<StepNumber, boolean>
  >({
    1: false,
    2: false,
    3: false,
  });

  const progress = useMemo(() => {
    const total = STEPS.length;
    const completed = STEPS.filter(
      (step) => completedSteps[step.number]
    ).length;
    return Math.round((completed / total) * 100);
  }, [completedSteps]);

  const firedBuckets = useRef(new Set<string>());

  useEffect(() => {
    const completedCount = STEPS.filter(
      (step) => completedSteps[step.number]
    ).length;
    let bucket: "33" | "66" | "100" | null = null;
    if (completedCount === 1) {
      bucket = "33";
    } else if (completedCount === 2) {
      bucket = "66";
    } else if (completedCount === 3) {
      bucket = "100";
    }
    if (bucket && !firedBuckets.current.has(bucket)) {
      firedBuckets.current.add(bucket);
      trackTutorialProgressBucket({ bucket, activeStep });
    }
  }, [completedSteps, activeStep]);

  const toggleStepDone = (step: StepNumber) => {
    const nextState = completedSteps[step] ? "pending" : "done";
    trackTutorialStepToggled({ stepNumber: step, nextState });
    setCompletedSteps((previous) => ({ ...previous, [step]: !previous[step] }));
  };

  const goToPreviousStep = () => {
    if (activeStep === 1) {
      return;
    }
    setActiveStep((activeStep - 1) as StepNumber);
  };

  const goToNextStep = () => {
    if (activeStep === 3) {
      return;
    }
    setActiveStep((activeStep + 1) as StepNumber);
  };

  useEffect(() => {
    const stepFromUrl = parseStepParameter(searchParams.get("step"));
    setActiveStep((currentStep) =>
      currentStep === stepFromUrl ? currentStep : stepFromUrl
    );
  }, [searchParams]);

  useEffect(() => {
    const stepInUrl = searchParams.get("step");
    const expectedStep = String(activeStep);
    if (stepInUrl === expectedStep) {
      return;
    }

    const nextSearch = new URLSearchParams(searchParams);
    nextSearch.set("step", expectedStep);
    setSearchParams(nextSearch, { replace: true });
  }, [activeStep, searchParams, setSearchParams]);

  return {
    activeStep,
    completedSteps,
    progress,
    goToNextStep,
    goToPreviousStep,
    setActiveStep,
    toggleStepDone,
  };
};

interface TutorialStepsProps {
  activeStep: StepNumber;
  completedSteps: Record<StepNumber, boolean>;
  onSelectStep: (step: StepNumber) => void;
  t: TFunction;
}

const TutorialSteps = ({
  activeStep,
  completedSteps,
  onSelectStep,
  t,
}: Readonly<TutorialStepsProps>) => (
  <section className="grid gap-3 md:grid-cols-3">
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
              {t("convention.registrationTutorial.steps.label", {
                number,
              })}
            </span>
            <Icon className="h-4 w-4 text-accent/80" />
          </div>
          <p className="text-base font-semibold text-foreground">
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

interface TutorialInteractivePanelProps {
  activeStep: StepNumber;
  completedSteps: Record<StepNumber, boolean>;
  progress: number;
  onToggleDone: (step: StepNumber) => void;
  onPrevious: () => void;
  onNext: () => void;
  t: TFunction;
}

const TutorialInteractivePanel = ({
  activeStep,
  completedSteps,
  progress,
  onToggleDone,
  onPrevious,
  onNext,
  t,
}: Readonly<TutorialInteractivePanelProps>) => {
  const activeStepKey = `convention.registrationTutorial.steps.step${activeStep}`;

  return (
    <section className="grid gap-5 rounded-2xl border border-white/10 bg-surface/20 p-5 md:grid-cols-[1.2fr_1fr] md:p-6">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-surface/40 p-3">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-background/60 p-2">
          <StepIllustration step={activeStep} />
        </div>
      </div>
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
            disabled={activeStep === 3}
          >
            {t("convention.registrationTutorial.interactive.next")}
          </Button>
        </div>
      </div>
    </section>
  );
};

const TutorialChecklist = ({ t }: Readonly<{ t: TFunction }>) => (
  <section className="grid gap-4 rounded-2xl border border-white/10 bg-surface/20 p-6 md:grid-cols-2">
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
      <Button asChild variant="outline" className="border-white/15">
        <a
          href="https://moonfest-b63fa.web.app/page/moonfest/soon.html"
          target="_blank"
          rel="noreferrer"
          data-funnel-step="start_checkout"
          data-cta-id="registration_tutorial_ticket"
          data-cta-variant="tutorial_secondary"
          data-content-section="registration_tutorial"
          data-content-id="buy_ticket_link"
          data-content-interaction="open"
        >
          {t("convention.registrationTutorial.actions.ticket")}
        </a>
      </Button>
      <p className="text-xs text-muted-foreground">
        {t("convention.registrationTutorial.actions.note")}
      </p>
    </div>
  </section>
);

/**
 * Three-step registration tutorial page that guides users through the hotel booking and ticketing process.
 * Exported as `Component` for React Router's `lazy` route loader.
 */
export function Component() {
  const { t } = useTranslation();

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.16),transparent_58%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/?section=registration">
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
          t={t}
        />
        <TutorialChecklist t={t} />
      </div>
      <div {...tid("registration-tutorial-page")} />
    </div>
  );
}

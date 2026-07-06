import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  trackTutorialStepSelected,
  trackTutorialStepToggled,
  trackTutorialProgressBucket,
} from "@/features/analytics/infrastructure/extremeTracking";
import type { StepNumber } from "@/features/registration-tutorial/domain/tutorialSteps";
import {
  LAST_STEP,
  STEPS,
} from "@/features/registration-tutorial/domain/tutorialSteps";

/** Default completion state for all steps. */
const INITIAL_COMPLETED: Record<StepNumber, boolean> = {
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
};

/** Parses a URL search parameter value into a valid step number, defaulting to 1. */
const parseStepParameter = (value: string | null): StepNumber => {
  const parsed = Number(value);
  if (parsed >= 1 && parsed <= LAST_STEP) {
    return parsed as StepNumber;
  }
  return 1;
};

/** Manages tutorial step navigation, completion state, and progress tracking via URL search params. */
export const useTutorialStepState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [completedSteps, setCompletedSteps] =
    useState<Record<StepNumber, boolean>>(INITIAL_COMPLETED);
  const activeStep = parseStepParameter(searchParams.get("step"));

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
    let bucket: "20" | "40" | "60" | "80" | "100" | null = null;
    if (completedCount === 1) {
      bucket = "20";
    } else if (completedCount === 2) {
      bucket = "40";
    } else if (completedCount === 3) {
      bucket = "60";
    } else if (completedCount === 4) {
      bucket = "80";
    } else if (completedCount === 5) {
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
    const previousStep = (activeStep - 1) as StepNumber;
    trackTutorialStepSelected({
      stepNumber: previousStep,
      origin: "prev_button",
    });
    const nextSearch = new URLSearchParams(searchParams);
    nextSearch.set("step", String(previousStep));
    setSearchParams(nextSearch, { replace: true });
  };

  const goToNextStep = () => {
    if (activeStep === LAST_STEP) {
      return;
    }
    const nextStep = (activeStep + 1) as StepNumber;
    trackTutorialStepSelected({ stepNumber: nextStep, origin: "next_button" });
    const nextSearch = new URLSearchParams(searchParams);
    nextSearch.set("step", String(nextStep));
    setSearchParams(nextSearch, { replace: true });
  };

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
    setActiveStep: (step: StepNumber) => {
      const nextSearch = new URLSearchParams(searchParams);
      nextSearch.set("step", String(step));
      setSearchParams(nextSearch, { replace: true });
    },
    toggleStepDone,
  };
};

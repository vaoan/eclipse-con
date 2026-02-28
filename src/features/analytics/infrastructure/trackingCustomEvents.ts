import {
  isConsentPreferencePayload,
  isContentInteractionPayload,
  isDemographicsPayload,
  isExperimentExposurePayload,
  isFunnelStepPayload,
  type ConsentPreferencePayload,
  type ContentInteractionPayload,
  type DemographicsPayload,
  type ExperimentExposurePayload,
  type FunnelStepPayload,
} from "@/features/analytics/infrastructure/trackingSchema";

const EVENT_DEMOGRAPHICS = "analytics:demographics";
const EVENT_CONTENT_INTERACTION = "analytics:content_interaction";
const EVENT_FUNNEL_STEP = "analytics:funnel_step";
const EVENT_EXPERIMENT_EXPOSURE = "analytics:experiment_exposure";
const EVENT_CONSENT_PREFERENCE = "analytics:consent_preference";
const EVENT_TUTORIAL_STEP_SELECTED = "analytics:tutorial_step_selected";
const EVENT_TUTORIAL_STEP_TOGGLED = "analytics:tutorial_step_toggled";
const EVENT_TUTORIAL_PROGRESS_BUCKET = "analytics:tutorial_progress_bucket";

/** Payload shape for a tutorial step selected event, including which step and the interaction origin. */
export interface RegistrationTutorialStepSelectedPayload {
  stepNumber: number;
  origin: string;
}

/** Payload shape for a tutorial step toggled event, indicating the step and its next completion state. */
export interface RegistrationTutorialStepToggledPayload {
  stepNumber: number;
  nextState: "done" | "pending";
}

/** Payload shape for a tutorial step progress bucket event. */
export interface RegistrationTutorialProgressBucketPayload {
  bucket: "33" | "66" | "100";
  activeStep: number;
}

interface CustomTrackingHandlers {
  onDemographics: (payload: DemographicsPayload) => void;
  onContentInteraction: (payload: ContentInteractionPayload) => void;
  onFunnelStep: (payload: FunnelStepPayload) => void;
  onExperimentExposure: (payload: ExperimentExposurePayload) => void;
  onConsentPreference: (payload: ConsentPreferencePayload) => void;
  onTutorialStepSelected: (
    payload: RegistrationTutorialStepSelectedPayload
  ) => void;
  onTutorialStepToggled: (
    payload: RegistrationTutorialStepToggledPayload
  ) => void;
  onTutorialProgressBucket: (
    payload: RegistrationTutorialProgressBucketPayload
  ) => void;
}

function dispatchTrackingEvent(eventName: string, payload: unknown): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<unknown>(eventName, {
      detail: payload,
    })
  );
}

/** Dispatches a demographics data event via the custom events bus. */
export function trackDemographics(payload: DemographicsPayload): void {
  dispatchTrackingEvent(EVENT_DEMOGRAPHICS, payload);
}

/** Dispatches a content interaction event via the custom events bus. */
export function trackContentInteraction(
  payload: ContentInteractionPayload
): void {
  dispatchTrackingEvent(EVENT_CONTENT_INTERACTION, payload);
}

/** Dispatches a funnel step event via the custom events bus. */
export function trackFunnelStep(payload: FunnelStepPayload): void {
  dispatchTrackingEvent(EVENT_FUNNEL_STEP, payload);
}

/** Dispatches an experiment exposure event via the custom events bus. */
export function trackExperimentExposure(
  payload: ExperimentExposurePayload
): void {
  dispatchTrackingEvent(EVENT_EXPERIMENT_EXPOSURE, payload);
}

/** Dispatches a consent preference updated event via the custom events bus. */
export function trackConsentPreference(
  payload: ConsentPreferencePayload
): void {
  dispatchTrackingEvent(EVENT_CONSENT_PREFERENCE, payload);
}

/** Dispatches a tutorial step selected event via the custom events bus. */
export function trackTutorialStepSelected(
  payload: RegistrationTutorialStepSelectedPayload
): void {
  dispatchTrackingEvent(EVENT_TUTORIAL_STEP_SELECTED, payload);
}

/** Dispatches a tutorial step toggled event via the custom events bus. */
export function trackTutorialStepToggled(
  payload: RegistrationTutorialStepToggledPayload
): void {
  dispatchTrackingEvent(EVENT_TUTORIAL_STEP_TOGGLED, payload);
}

/** Dispatches a tutorial progress bucket event via the custom events bus. */
export function trackTutorialProgressBucket(
  payload: RegistrationTutorialProgressBucketPayload
): void {
  dispatchTrackingEvent(EVENT_TUTORIAL_PROGRESS_BUCKET, payload);
}

/** Attaches window event listeners for all custom analytics events and routes them to the provided handlers. */
export function registerCustomTrackingListeners(
  handlers: CustomTrackingHandlers
): void {
  window.addEventListener(EVENT_DEMOGRAPHICS, (event: Event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail: unknown = event.detail;
    if (isDemographicsPayload(detail)) {
      handlers.onDemographics(detail);
    }
  });

  window.addEventListener(EVENT_CONTENT_INTERACTION, (event: Event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail: unknown = event.detail;
    if (isContentInteractionPayload(detail)) {
      handlers.onContentInteraction(detail);
    }
  });

  window.addEventListener(EVENT_FUNNEL_STEP, (event: Event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail: unknown = event.detail;
    if (isFunnelStepPayload(detail)) {
      handlers.onFunnelStep(detail);
    }
  });

  window.addEventListener(EVENT_EXPERIMENT_EXPOSURE, (event: Event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail: unknown = event.detail;
    if (isExperimentExposurePayload(detail)) {
      handlers.onExperimentExposure(detail);
    }
  });

  window.addEventListener(EVENT_CONSENT_PREFERENCE, (event: Event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const detail: unknown = event.detail;
    if (isConsentPreferencePayload(detail)) {
      handlers.onConsentPreference(detail);
    }
  });

  window.addEventListener(EVENT_TUTORIAL_STEP_SELECTED, (event: Event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }
    const detail =
      event.detail as Partial<RegistrationTutorialStepSelectedPayload>;
    if (
      typeof detail.stepNumber === "number" &&
      typeof detail.origin === "string"
    ) {
      handlers.onTutorialStepSelected(
        detail as RegistrationTutorialStepSelectedPayload
      );
    }
  });

  window.addEventListener(EVENT_TUTORIAL_STEP_TOGGLED, (event: Event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }
    const detail =
      event.detail as Partial<RegistrationTutorialStepToggledPayload>;
    if (
      typeof detail.stepNumber === "number" &&
      (detail.nextState === "done" || detail.nextState === "pending")
    ) {
      handlers.onTutorialStepToggled(
        detail as RegistrationTutorialStepToggledPayload
      );
    }
  });

  window.addEventListener(EVENT_TUTORIAL_PROGRESS_BUCKET, (event: Event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }
    const detail =
      event.detail as Partial<RegistrationTutorialProgressBucketPayload>;
    if (
      typeof detail.activeStep === "number" &&
      (detail.bucket === "33" ||
        detail.bucket === "66" ||
        detail.bucket === "100")
    ) {
      handlers.onTutorialProgressBucket(
        detail as RegistrationTutorialProgressBucketPayload
      );
    }
  });
}

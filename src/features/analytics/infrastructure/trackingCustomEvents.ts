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

interface CustomTrackingHandlers {
  onDemographics: (payload: DemographicsPayload) => void;
  onContentInteraction: (payload: ContentInteractionPayload) => void;
  onFunnelStep: (payload: FunnelStepPayload) => void;
  onExperimentExposure: (payload: ExperimentExposurePayload) => void;
  onConsentPreference: (payload: ConsentPreferencePayload) => void;
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

export function trackDemographics(payload: DemographicsPayload): void {
  dispatchTrackingEvent(EVENT_DEMOGRAPHICS, payload);
}

export function trackContentInteraction(
  payload: ContentInteractionPayload
): void {
  dispatchTrackingEvent(EVENT_CONTENT_INTERACTION, payload);
}

export function trackFunnelStep(payload: FunnelStepPayload): void {
  dispatchTrackingEvent(EVENT_FUNNEL_STEP, payload);
}

export function trackExperimentExposure(
  payload: ExperimentExposurePayload
): void {
  dispatchTrackingEvent(EVENT_EXPERIMENT_EXPOSURE, payload);
}

export function trackConsentPreference(
  payload: ConsentPreferencePayload
): void {
  dispatchTrackingEvent(EVENT_CONSENT_PREFERENCE, payload);
}

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
}

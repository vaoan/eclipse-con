export interface ConventionEvent {
  readonly id: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly icon: string;
}

export interface Guest {
  readonly id: string;
  readonly nameKey: string;
  readonly roleKey: string;
  readonly bioKey: string;
  readonly initials: string;
}

export interface TicketTier {
  readonly id: string;
  readonly nameKey: string;
  readonly priceKey: string;
  readonly featuresKeys: readonly string[];
  readonly highlighted: boolean;
}

export interface FaqItem {
  readonly id: string;
  readonly questionKey: string;
  readonly answerKey: string;
}

/** Represents a scheduled activity or event at the convention. */
export interface ConventionEvent {
  readonly id: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly icon: string;
}

/** Represents a featured guest or organizer with translated bio data. */
export interface Guest {
  readonly id: string;
  readonly nameKey: string;
  readonly roleKey: string;
  readonly bioKey: string;
  readonly initials: string;
  readonly imageSrc: string;
}

/** Represents a registration package tier with pricing and included features. */
export interface TicketTier {
  readonly id: string;
  readonly nameKey: string;
  readonly priceKey: string;
  readonly featuresKeys: readonly string[];
  readonly highlighted: boolean;
}

/** Represents a single FAQ entry with an optional categorization theme. */
export interface FaqItem {
  readonly id: string;
  readonly questionKey: string;
  readonly answerKey: string;
  readonly theme?: string;
}

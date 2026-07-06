import {
  BedDouble,
  CreditCard,
  ExternalLink,
  MousePointerClick,
  Users,
} from "lucide-react";

/** Valid step numbers for the hotel booking tutorial. */
export type StepNumber = (typeof STEPS)[number]["number"];

/** The five hotel booking tutorial steps with their icons. */
export const STEPS = [
  { number: 1, Icon: MousePointerClick },
  { number: 2, Icon: ExternalLink },
  { number: 3, Icon: Users },
  { number: 4, Icon: BedDouble },
  { number: 5, Icon: CreditCard },
] as const;

/** The last step number in the tutorial sequence. */
export const LAST_STEP: StepNumber = 5;

/** Tutorial step screenshot paths served from public/tutorial/. */
export const STEP_IMAGES: Record<StepNumber, string> = {
  1: "/tutorial/step-0.webp",
  2: "/tutorial/step-1.webp",
  3: "/tutorial/step-2.webp",
  4: "/tutorial/step-3.webp",
  5: "/tutorial/step-4.webp",
};

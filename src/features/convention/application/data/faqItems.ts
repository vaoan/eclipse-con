import type { FaqItem } from "@/features/convention/domain/types";

/** Static list of frequently asked questions displayed in the FAQ section. */
export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: "q1",
    questionKey: "convention.faq.q1.question",
    answerKey: "convention.faq.q1.answer",
    theme: "package_constraint",
  },
  {
    id: "q2",
    questionKey: "convention.faq.q2.question",
    answerKey: "convention.faq.q2.answer",
  },
  {
    id: "q3",
    questionKey: "convention.faq.q3.question",
    answerKey: "convention.faq.q3.answer",
    theme: "reservation_process",
  },
  {
    id: "q4",
    questionKey: "convention.faq.q4.question",
    answerKey: "convention.faq.q4.answer",
    theme: "payment_deadline",
  },
  {
    id: "q5",
    questionKey: "convention.faq.q5.question",
    answerKey: "convention.faq.q5.answer",
    theme: "hotel_requirement",
  },
  {
    id: "q6",
    questionKey: "convention.faq.q6.question",
    answerKey: "convention.faq.q6.answer",
    theme: "ticket_dependency",
  },
  {
    id: "q7",
    questionKey: "convention.faq.q7.question",
    answerKey: "convention.faq.q7.answer",
    theme: "reservation_change",
  },
  {
    id: "q8",
    questionKey: "convention.faq.q8.question",
    answerKey: "convention.faq.q8.answer",
  },
];

import { tid } from "@/lib/tid";

/** Props for {@link FaqItem}. */
interface FaqItemProps {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

/**
 * Single FAQ entry as a native `<details>` disclosure. Ported from moonfest's
 * FaqAccordionItem (which used the shadcn accordion sunfest does not have).
 */
export function FaqItem({ id, question, answer }: Readonly<FaqItemProps>) {
  return (
    <details
      className="group border-b border-white/5"
      data-testid={tid(`faq-item-${id}`)}
    >
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-semibold text-foreground transition-colors hover:text-accent [&::-webkit-details-marker]:hidden"
        data-content-section="faq"
        data-content-id={`faq_${id}`}
        data-content-interaction="expand"
      >
        {question}
        <span
          className="shrink-0 text-xl text-accent transition-transform duration-200 group-open:rotate-45"
          aria-hidden="true"
        >
          +
        </span>
      </summary>
      <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
        {answer}
      </p>
    </details>
  );
}

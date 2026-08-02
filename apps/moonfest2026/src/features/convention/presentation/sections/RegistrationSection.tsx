import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  BedDouble,
  BookOpen,
  Check,
  Hotel,
  Ticket,
} from "lucide-react";

import {
  PACKAGE_FEATURE_KEYS,
  PRICE_TIERS,
  TICKET_FEATURE_KEYS,
} from "@/features/convention/application/data/registration";
import { Button } from "@/shared/presentation/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/presentation/ui/card";
import {
  RESERVATION_URL,
  SECTION_IDS,
  TICKET_URL_LOCAL,
} from "@/features/convention/domain/constants";
import { tid } from "@/shared/application/utils/tid";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";

/** Renders the Registration section with a two-step flow: hotel reservation and event ticket. */
export function RegistrationSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id={SECTION_IDS.REGISTRATION} surfaceTone="elevated">
      <SectionHeader
        title={t("convention.registration.title")}
        subtitle={t("convention.registration.subtitle")}
        align="left"
        accent="gold"
      />
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <HotelCard t={t} />
        <TicketCard t={t} />
      </div>
      <RegistrationCta t={t} />
    </SectionWrapper>
  );
}

/** Step 1 card: hotel reservation with room pricing. */
function HotelCard({ t }: Readonly<{ t: TFunction }>) {
  return (
    <Card
      className="flex flex-col border-accent/50 bg-surface-elevated shadow-lg shadow-accent/10"
      data-content-section="registration"
      data-content-id="registration_step1_hotel"
      {...tid("registration-card-hotel")}
    >
      <CardHeader className="gap-2">
        <StepBadge label={t("convention.registration.step1.label")} />
        <CardTitle className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <Hotel size={20} className="shrink-0 text-accent" />
          {t("convention.registration.step1.title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("convention.registration.step1.description")}
        </p>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <ul className="space-y-3">
          {PACKAGE_FEATURE_KEYS.map((key) => (
            <li
              key={key}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Check size={16} className="shrink-0 text-accent" />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
        <SoldOutPriceBox t={t} />
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <div
          className="flex w-full items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-left"
          data-content-section="registration"
          data-content-id="registration_reserve_sold_out"
          data-content-interaction="blocked"
        >
          <BedDouble
            size={18}
            className="mt-0.5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-foreground/80">
            {t("convention.registration.step1.soldOutMessage")}
          </p>
        </div>
        <a
          href={RESERVATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-center text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
          data-cta-id="registration_reserve_check"
          data-cta-variant="step1_hotel_check"
          data-content-section="registration"
          data-content-id="registration_reserve_check"
          data-content-interaction="open"
          {...tid("registration-reserve-check-link")}
        >
          {t("convention.registration.step1.checkAvailability")}
          <ArrowRight className="h-3 w-3 opacity-60" aria-hidden="true" />
        </a>
      </CardFooter>
    </Card>
  );
}

/** Step 2 card: event ticket with included features. */
function TicketCard({ t }: Readonly<{ t: TFunction }>) {
  return (
    <Card
      className="flex flex-col border-accent/50 bg-surface-elevated shadow-lg shadow-accent/10"
      data-content-section="registration"
      data-content-id="registration_step2_ticket"
      {...tid("registration-card-ticket")}
    >
      <CardHeader className="gap-2">
        <StepBadge label={t("convention.registration.step2.label")} />
        <CardTitle className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <Ticket size={20} className="shrink-0 text-accent" />
          {t("convention.registration.step2.title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("convention.registration.step2.description")}
        </p>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-center">
          <p className="font-display text-2xl font-bold text-accent drop-shadow-[0_0_6px_rgba(224,117,58,0.3)]">
            {t("convention.registration.step2.price")}
          </p>
          <p className="mt-1 text-xs text-accent/75">
            {t("convention.registration.step2.priceNote")}
          </p>
        </div>
        <ul className="space-y-3">
          {TICKET_FEATURE_KEYS.map((key) => (
            <li
              key={key}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Check size={16} className="shrink-0 text-accent" />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button asChild variant="glow" size="lg" className="w-full">
          <a
            href={TICKET_URL_LOCAL}
            target="_blank"
            rel="noopener noreferrer"
            data-funnel-step="start_checkout"
            data-cta-id="registration_ticket_local"
            data-cta-variant="step2_ticket_local"
            data-content-section="registration"
            data-content-id="registration_ticket_local"
            data-content-interaction="open"
            {...tid("registration-ticket-cta-local")}
          >
            {t("convention.registration.ticketCtaLocal")}
          </a>
        </Button>
        <Button
          variant="glow-muted"
          size="lg"
          className="w-full"
          disabled
          data-cta-id="registration_ticket_international"
          data-cta-variant="step2_ticket_international"
          data-content-section="registration"
          data-content-id="registration_ticket_international"
          data-content-interaction="blocked"
          {...tid("registration-ticket-cta-international")}
        >
          {t("convention.registration.step2.internationalSoldOut")}
        </Button>
        <p className="text-xs leading-relaxed text-foreground/80">
          {t("convention.registration.step2.internationalSoldOutMessage")}
        </p>
      </CardFooter>
    </Card>
  );
}

/**
 * Step 1 price box rendered in the "sold out" state: the rooms list is
 * desaturated and crossed out, the header pivots from "Popular" to
 * "Fully booked", and a torn-edge ribbon is stamped diagonally across the
 * panel to make the unavailability immediate and unmistakable.
 */
function SoldOutPriceBox({ t }: Readonly<{ t: TFunction }>) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-destructive/40 bg-destructive/5 p-4 shadow-[inset_0_1px_0_0_rgba(220,38,38,0.12)]"
      data-content-section="registration"
      data-content-id="registration_step1_sold_out"
      {...tid("registration-sold-out-box")}
    >
      <div aria-hidden="true" className="opacity-40 saturate-50">
        <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-destructive">
          <BedDouble size={12} className="shrink-0" />
          {t("convention.registration.step1.fullyBooked")}
        </p>
        <div className="space-y-3">
          {PRICE_TIERS.map(({ nameKey, priceKey }) => (
            <div
              key={nameKey}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-sm text-foreground/90 line-through decoration-destructive/70 decoration-2">
                {t(nameKey)}
              </span>
              <span className="font-display text-base font-bold text-foreground/60 line-through decoration-destructive/70 decoration-2">
                {t(priceKey)}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {t("convention.registration.priceNote")}
        </p>
      </div>
      <SoldOutRibbon t={t} />
    </div>
  );
}

/**
 * Torn-edge diagonal ribbon used as the sold-out stamp on the Step 1 price
 * box. Notched ends and a diagonal hatch overlay give it a stamped, postal
 * feel; the rotation breaks the grid to draw the eye.
 */
function SoldOutRibbon({ t }: Readonly<{ t: TFunction }>) {
  return (
    <div
      className="pointer-events-none absolute inset-x-[-14px] top-1/2 flex -translate-y-1/2 -rotate-[7deg] items-center"
      aria-hidden="true"
    >
      <div
        className="relative w-full border-y border-red-950/70 bg-gradient-to-r from-red-900 via-destructive to-red-900 py-3 shadow-[0_18px_50px_-12px_rgba(220,38,38,0.65)]"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)",
        }}
      >
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent_0,transparent_7px,rgba(0,0,0,0.16)_7px,rgba(0,0,0,0.16)_9px)]" />
        <div className="relative flex items-center justify-center gap-3 text-white">
          <span className="h-px w-6 bg-white/70 sm:w-10" />
          <p className="font-display text-lg font-black uppercase tracking-[0.35em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] sm:text-xl sm:tracking-[0.4em]">
            {t("convention.registration.step1.soldOut")}
          </p>
          <span className="h-px w-6 bg-white/70 sm:w-10" />
        </div>
      </div>
    </div>
  );
}

/** Small badge indicating a step number. */
function StepBadge({ label }: Readonly<{ label: string }>) {
  return (
    <span className="w-fit rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
      {label}
    </span>
  );
}

/** Bottom CTA area with tutorial link, notes, and contact info. */
function RegistrationCta({ t }: Readonly<{ t: TFunction }>) {
  return (
    <div className="mt-10 flex flex-col items-center gap-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
        {t("convention.registration.highlight")}
      </p>
      <Link
        to="/registration-tutorial"
        className="group inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-6 py-3 text-sm font-semibold text-accent shadow-[0_0_12px_rgba(224,117,58,0.1)] transition-all hover:border-accent/60 hover:bg-accent/20 hover:shadow-[0_0_20px_rgba(224,117,58,0.15)]"
        data-funnel-step="registration_tutorial"
        data-cta-id="registration_tutorial_interest"
        data-cta-variant="secondary"
        data-content-section="registration"
        data-content-id="registration_tutorial_link"
        data-content-interaction="open"
        {...tid("registration-tutorial-link")}
      >
        <BookOpen className="h-4 w-4" />
        {t("convention.registration.tutorialLink")}
        <ArrowRight className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
      </Link>
      <p className="text-sm text-muted-foreground">
        {t("convention.registration.noteServices")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("convention.registration.note")}
      </p>
    </div>
  );
}

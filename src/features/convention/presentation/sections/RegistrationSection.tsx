import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { TICKET_TIERS } from "@/features/convention/application/data/ticketTiers";
import { BakenekoSilhouette } from "../components/BakenekoSilhouette";
import { CraneSilhouette } from "../components/CraneSilhouette";
import { KitsuneSilhouette } from "../components/KitsuneSilhouette";
import { KoiSilhouette } from "../components/KoiSilhouette";
import { SectionParallaxLayer } from "../components/SectionParallaxLayer";
import { SectionWrapper } from "../components/SectionWrapper";
import { TanukiSilhouette } from "../components/TanukiSilhouette";
import { TicketCard } from "../components/TicketCard";

export function RegistrationSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper
      id={SECTION_IDS.REGISTRATION}
      className="bg-surface"
      decorations={
        <>
          {/* Giant trotting fox — charging in from bottom-left */}
          <SectionParallaxLayer
            speed={0.06}
            className="pointer-events-none absolute inset-0"
          >
            <div className="float-gentle absolute -bottom-[25%] -left-[8%] w-[24rem] opacity-[0.05] md:w-[42rem]">
              <KitsuneSilhouette variant="trotting" className="text-accent" />
            </div>
          </SectionParallaxLayer>
          {/* Tanuki tumbling from top-right, slightly tilted */}
          <SectionParallaxLayer
            speed={-0.05}
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="sway-gentle absolute -top-[32%] -right-[10%] w-[18rem] -rotate-[12deg] opacity-[0.045] md:w-[34rem]"
              style={{ animationDelay: "1s" }}
            >
              <TanukiSilhouette className="text-sakura" />
            </div>
          </SectionParallaxLayer>
          {/* Bakeneko lurking at the left edge */}
          <SectionParallaxLayer
            speed={0.08}
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="float-gentle absolute top-[5%] -left-[16%] w-[14rem] opacity-[0.04] md:w-[26rem]"
              style={{ animationDelay: "2s" }}
            >
              <BakenekoSilhouette className="text-primary" />
            </div>
          </SectionParallaxLayer>
          {/* Big koi arcing across bottom-right */}
          <SectionParallaxLayer
            speed={0.04}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -bottom-[12%] -right-[8%] w-[16rem] rotate-[25deg] opacity-[0.04] md:w-[30rem]">
              <div className="swim-drift" style={{ animationDelay: "3s" }}>
                <KoiSilhouette className="text-primary" />
              </div>
            </div>
          </SectionParallaxLayer>
          {/* Cranes — one high-left, one mid-right */}
          <SectionParallaxLayer
            speed={0.03}
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="drift-cloud absolute top-[6%] left-[30%] w-[10rem] -rotate-3 opacity-[0.04] md:w-[18rem]"
              style={{ animationDelay: "4s" }}
            >
              <CraneSilhouette className="text-accent" />
            </div>
            <div
              className="drift-cloud absolute top-[50%] -right-[4%] w-[8rem] opacity-[0.035] md:w-[14rem]"
              style={{ animationDelay: "5s" }}
            >
              <CraneSilhouette className="text-foreground" />
            </div>
          </SectionParallaxLayer>
        </>
      }
    >
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
          {t("convention.registration.title")}
        </h2>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-accent" />
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          {t("convention.registration.subtitle")}
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {TICKET_TIERS.map((tier) => (
          <TicketCard key={tier.id} tier={tier} />
        ))}
      </div>
      <RegistrationCta t={t} />
    </SectionWrapper>
  );
}

function RegistrationCta({ t }: Readonly<{ t: TFunction }>) {
  return (
    <div className="mt-10 flex flex-col items-center gap-4 text-center">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href="https://www.estelarpaipa.com/es/"
          className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-glow"
          target="_blank"
          rel="noreferrer"
        >
          {t("convention.registration.reserveLink")}
        </a>
        <a
          href="https://moonfest-b63fa.web.app/page/moonfest/soon.html"
          className="inline-flex items-center justify-center rounded-lg border border-white/10 px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-accent/40 hover:text-accent"
          target="_blank"
          rel="noreferrer"
        >
          {t("convention.registration.ticketLink")}
        </a>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("convention.registration.devNote")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("convention.registration.note")}
      </p>
    </div>
  );
}

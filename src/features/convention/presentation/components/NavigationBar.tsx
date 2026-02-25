import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";

import { cn } from "@/shared/application/utils/cn";
import { tid } from "@/shared/application/utils/tid";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { LanguageToggle } from "./LanguageToggle";

const NAV_SECTIONS = [
  { id: SECTION_IDS.ABOUT, key: "convention.nav.about" },
  { id: SECTION_IDS.EVENTS, key: "convention.nav.events" },
  { id: SECTION_IDS.VENUE, key: "convention.nav.venue" },
  { id: SECTION_IDS.REGISTRATION, key: "convention.nav.registration" },
  { id: SECTION_IDS.FAQ, key: "convention.nav.faq" },
  { id: SECTION_IDS.GUESTS, key: "convention.nav.guests" },
] as const;

export function NavigationBar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      data-anchor-nav="true"
      className={cn(
        "fixed top-0 right-0 left-0 z-50",
        "border-b border-white/5 bg-background/80 backdrop-blur-md"
      )}
      {...tid("navigation-bar")}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href={`#${SECTION_IDS.HERO}`} className="flex items-center">
          <img
            src="/moonfest-logo.svg"
            alt={t("convention.hero.logoAlt")}
            className="h-8 w-auto sm:h-9"
            loading="lazy"
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-sm text-foreground/70 transition-colors hover:text-accent"
            >
              {t(section.key)}
            </a>
          ))}
          <LanguageToggle />
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className="text-foreground/70 transition-colors hover:text-accent"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            {...tid("mobile-menu-toggle")}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="border-t border-white/5 bg-background/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {NAV_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-surface hover:text-accent"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                {t(section.key)}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

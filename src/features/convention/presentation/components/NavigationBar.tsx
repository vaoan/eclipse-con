import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  { id: SECTION_IDS.NEWS, key: "convention.nav.news" },
  { id: SECTION_IDS.GUESTS, key: "convention.nav.guests" },
] as const;

export function NavigationBar() {
  const { t } = useTranslation();

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
        <div className="hidden items-center gap-1.5 md:flex">
          {NAV_SECTIONS.map((section) => (
            <Button
              key={section.id}
              asChild
              variant="ghost"
              className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70 hover:bg-transparent hover:text-accent focus-visible:bg-transparent"
            >
              <a href={`#${section.id}`}>{t(section.key)}</a>
            </Button>
          ))}
          <LanguageToggle />
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/70 hover:text-accent"
                aria-label={t("convention.nav.mobileToggle")}
                {...tid("mobile-menu-toggle")}
              >
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-white/10 bg-background/95 backdrop-blur"
            >
              <SheetHeader>
                <SheetTitle className="font-display text-lg">
                  {t("convention.nav.title")}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                {NAV_SECTIONS.map((section) => (
                  <SheetClose asChild key={section.id}>
                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start text-sm text-foreground/70 hover:bg-surface hover:text-accent"
                    >
                      <a href={`#${section.id}`}>{t(section.key)}</a>
                    </Button>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

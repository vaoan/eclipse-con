import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

const NAV_GROUPS = [
  {
    key: "convention.nav.about",
    items: [{ id: SECTION_IDS.ABOUT, key: "convention.nav.about" }],
  },
  {
    key: "convention.nav.event",
    items: [
      { id: SECTION_IDS.EVENT_OVERVIEW, key: "convention.nav.eventOverview" },
      { id: SECTION_IDS.EVENTS, key: "convention.nav.eventActivities" },
      { id: SECTION_IDS.REGISTRATION, key: "convention.nav.placePricing" },
    ],
  },
  {
    key: "convention.nav.place",
    items: [
      { id: SECTION_IDS.VENUE, key: "convention.nav.placeHotel" },
      { id: SECTION_IDS.TRAVEL, key: "convention.nav.placeTravel" },
      { id: SECTION_IDS.AMENITIES, key: "convention.nav.placeFind" },
    ],
  },
  {
    key: "convention.nav.community",
    items: [
      { id: SECTION_IDS.ATTENDEES, key: "convention.nav.communityAttendees" },
      { id: SECTION_IDS.GUESTS, key: "convention.nav.communityOrganizers" },
    ],
  },
  {
    key: "convention.nav.news",
    items: [{ id: SECTION_IDS.NEWS, key: "convention.nav.news" }],
  },
  {
    key: "convention.nav.faq",
    items: [{ id: SECTION_IDS.FAQ, key: "convention.nav.faq" }],
  },
] as const;

type NavGroup = (typeof NAV_GROUPS)[number];

const NAV_BUTTON_CLASS =
  "group relative px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-foreground/70 hover:bg-transparent hover:text-foreground focus-visible:bg-transparent";

function useCanHover() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => {
      setCanHover(query.matches);
    };
    update();
    query.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  return canHover;
}

function NavLinkButton({
  label,
  href,
}: Readonly<{ label: string; href: string }>) {
  return (
    <Button asChild variant="ghost" className={NAV_BUTTON_CLASS}>
      <a href={href} className="hover:cursor-pointer">
        <span className="relative">
          {label}
          <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-transparent via-accent/80 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
        </span>
      </a>
    </Button>
  );
}

function NavDropdownItem({
  label,
  href,
}: Readonly<{ label: string; href: string }>) {
  return (
    <DropdownMenuItem asChild className="rounded-lg px-4 py-2.5">
      <a
        href={href}
        className="flex items-center justify-between text-[0.86rem] font-medium text-foreground/75 transition-all duration-200 hover:cursor-pointer hover:text-foreground"
      >
        <span>{label}</span>
        <span className="text-[0.7rem] text-foreground/35">-&gt;</span>
      </a>
    </DropdownMenuItem>
  );
}

function DesktopNav({ groups }: Readonly<{ groups: readonly NavGroup[] }>) {
  const { t } = useTranslation();
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const canHover = useCanHover();

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      window.clearTimeout(hoverTimer.current);
    }
  };

  const handleOpen = (key: string) => {
    if (!canHover) {
      return;
    }
    clearHoverTimer();
    setHoverMenu(key);
  };

  const handleClose = () => {
    if (!canHover) {
      return;
    }
    clearHoverTimer();
    hoverTimer.current = window.setTimeout(() => {
      setHoverMenu(null);
    }, 140);
  };

  return (
    <div className="hidden items-center gap-1 md:flex">
      {groups.map((group) =>
        group.items.length === 1 ? (
          <NavLinkButton
            key={group.key}
            label={t(group.items[0].key)}
            href={`#${group.items[0].id}`}
          />
        ) : (
          <DropdownMenu
            key={group.key}
            modal={false}
            open={hoverMenu === group.key}
            onOpenChange={(open) => {
              setHoverMenu(open ? group.key : null);
            }}
          >
            <DropdownMenuTrigger
              asChild
              className="hover:cursor-pointer"
              onPointerEnter={() => {
                handleOpen(group.key);
              }}
              onPointerLeave={handleClose}
            >
              <Button variant="ghost" className={NAV_BUTTON_CLASS}>
                <span className="relative">
                  {t(group.key)}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-transparent via-accent/80 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="min-w-[260px] border-white/10 bg-gradient-to-b from-background/95 via-background/90 to-background/95 text-foreground shadow-2xl backdrop-blur-xl"
              onPointerEnter={() => {
                handleOpen(group.key);
              }}
              onPointerLeave={handleClose}
            >
              <div className="px-4 pb-2 pt-3 text-[0.7rem] font-medium tracking-[0.12em] text-muted-foreground">
                {t(group.key)}
              </div>
              <div className="flex flex-col gap-1 px-2 pb-3">
                {group.items.map((item) => (
                  <NavDropdownItem
                    key={item.id}
                    label={t(item.key)}
                    href={`#${item.id}`}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      )}
      <LanguageToggle />
    </div>
  );
}

function MobileNav({ groups }: Readonly<{ groups: readonly NavGroup[] }>) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 md:hidden">
      <LanguageToggle />
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="group relative h-11 w-11 rounded-full border border-white/10 bg-surface/40 text-foreground/80 shadow-[0_10px_30px_-18px_rgba(244,63,94,0.6)] transition hover:border-white/20 hover:bg-surface/70 hover:text-foreground"
            aria-label={t("convention.nav.mobileToggle")}
            {...tid("mobile-menu-toggle")}
          >
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.35),_transparent_65%)] opacity-0 transition duration-300 group-hover:opacity-100" />
            <Menu size={20} className="relative" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full border-white/10 bg-gradient-to-b from-background/95 via-background/92 to-background/95 backdrop-blur sm:max-w-md"
        >
          <div className="relative flex h-full flex-col">
            <div className="relative overflow-hidden border-b border-white/10 px-6 pb-6 pt-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.25),_transparent_62%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <SheetHeader className="p-0">
                  <SheetTitle className="font-display text-xl text-foreground">
                    {t("convention.nav.title")}
                  </SheetTitle>
                  <p className="text-xs uppercase tracking-[0.26em] text-foreground/50">
                    {t("convention.hero.date")}
                  </p>
                </SheetHeader>
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full border border-white/10 bg-surface/40 text-foreground/70 hover:bg-surface/70 hover:text-foreground"
                    aria-label={t("convention.nav.mobileToggle")}
                  >
                    <X size={16} />
                  </Button>
                </SheetClose>
              </div>
              <SheetClose asChild>
                <Button
                  asChild
                  variant="default"
                  className="mt-5 w-full rounded-full bg-accent text-xs font-semibold uppercase tracking-[0.28em] text-accent-foreground shadow-[0_16px_30px_-22px_rgba(244,63,94,0.7)]"
                >
                  <a href={`#${SECTION_IDS.REGISTRATION}`}>
                    {t("convention.hero.cta")}
                  </a>
                </Button>
              </SheetClose>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
              <Accordion
                type="single"
                collapsible
                className="flex flex-col gap-4"
              >
                {groups.map((group) =>
                  group.items.length === 1 ? (
                    <SheetClose asChild key={group.key}>
                      <Button
                        asChild
                        variant="ghost"
                        className="h-12 justify-between rounded-2xl border border-white/10 bg-surface/30 px-5 text-sm font-semibold uppercase tracking-[0.18em] text-foreground/75 hover:cursor-pointer hover:bg-surface/70 hover:text-foreground"
                      >
                        <a
                          href={`#${group.items[0].id}`}
                          className="flex w-full items-center justify-between"
                        >
                          <span>{t(group.items[0].key)}</span>
                          <span className="text-[0.7rem] text-foreground/40">
                            -&gt;
                          </span>
                        </a>
                      </Button>
                    </SheetClose>
                  ) : (
                    <AccordionItem
                      key={group.key}
                      value={group.key}
                      className="rounded-2xl border border-white/10 bg-surface/20"
                    >
                      <AccordionTrigger className="rounded-2xl px-5 text-sm font-semibold uppercase tracking-[0.18em] text-foreground/70 hover:bg-surface/60 hover:text-foreground">
                        {t(group.key)}
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-2 px-4 pb-4 pt-2">
                        {group.items.map((item) => (
                          <SheetClose asChild key={item.id}>
                            <Button
                              asChild
                              variant="ghost"
                              className="justify-between rounded-xl border border-white/5 bg-surface/40 px-4 py-3 text-sm text-foreground/70 hover:cursor-pointer hover:bg-surface/70 hover:text-foreground"
                            >
                              <a
                                href={`#${item.id}`}
                                className="flex w-full items-center justify-between gap-3 text-[0.95rem] font-medium hover:cursor-pointer"
                              >
                                <span>{t(item.key)}</span>
                                <span className="text-[0.7rem] text-foreground/40">
                                  -&gt;
                                </span>
                              </a>
                            </Button>
                          </SheetClose>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  )
                )}
              </Accordion>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function NavigationBar() {
  const { t } = useTranslation();

  return (
    <nav
      data-anchor-nav="true"
      className={cn(
        "fixed top-0 right-0 left-0 z-50",
        "border-b border-white/10 bg-gradient-to-r from-background/95 via-background/85 to-background/95 backdrop-blur-xl"
      )}
      {...tid("navigation-bar")}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a
          href={`#${SECTION_IDS.HERO}`}
          className="flex items-center hover:cursor-pointer"
        >
          <img
            src="/moonfest-logo.svg"
            alt={t("convention.hero.logoAlt")}
            className="h-8 w-auto sm:h-9"
            loading="lazy"
          />
        </a>
        <DesktopNav groups={NAV_GROUPS} />
        <MobileNav groups={NAV_GROUPS} />
      </div>
    </nav>
  );
}


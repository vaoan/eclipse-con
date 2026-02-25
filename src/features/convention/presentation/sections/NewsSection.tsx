/* eslint-disable max-lines, max-lines-per-function, sonarjs/cognitive-complexity, sonarjs/no-nested-conditional, @typescript-eslint/no-unnecessary-template-expression */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";
import {
  embeddedTelegramEn,
  embeddedTelegramEs,
} from "@/features/convention/infrastructure/telegram/embedded";
import {
  DEFAULT_NEWS_LAYOUT,
  NEWS_LAYOUT_MODES,
  type NewsLayoutMode,
  type TelegramArchive,
} from "./news/types";
import { useNewsRenderers } from "./news/renderers";

const INITIAL_VISIBLE = 12;
const PAGE_SIZE = 12;

const getGridClassName = (layoutMode: NewsLayoutMode) => {
  switch (layoutMode) {
    case "masonry":
      return "columns-1 gap-6 md:columns-2 xl:columns-3";
    case "mosaic":
      return "grid gap-4 md:grid-cols-4";
    case "zigzag":
      return "grid gap-6";
    case "diagonal":
      return "grid gap-6";
    case "wall":
      return "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";
    case "slanted":
      return "grid gap-6 md:grid-cols-2 xl:grid-cols-3";
    case "polaroid":
      return "grid gap-6 sm:grid-cols-2 lg:grid-cols-4";
    case "poster":
      return "grid gap-6 md:grid-cols-2 xl:grid-cols-3";
    case "gallery":
      return "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";
    case "split":
      return "grid gap-6 lg:grid-cols-2";
    case "ledger":
      return "space-y-4";
    case "billboard":
      return "space-y-6";
    case "index":
      return "space-y-4";
    case "magazine":
      return "grid gap-6 lg:grid-cols-3";
    default:
      return "grid gap-6 md:grid-cols-2 xl:grid-cols-3";
  }
};

const getMosaicSpan = (layoutMode: NewsLayoutMode, index: number) => {
  if (layoutMode !== "mosaic") {
    return "";
  }
  if (index % 5 === 0) {
    return "md:col-span-2 md:row-span-2";
  }
  if (index % 3 === 0) {
    return "md:col-span-2";
  }
  return "";
};

export function NewsSection() {
  const { t, i18n } = useTranslation();
  const { renderMedia, renderText, renderPreview } = useNewsRenderers();
  const [archive, setArchive] = useState<TelegramArchive | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [layoutMode, setLayoutMode] = useState<NewsLayoutMode>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_NEWS_LAYOUT;
    }
    const stored = window.localStorage.getItem("newsLayoutMode");
    return NEWS_LAYOUT_MODES.some((mode) => mode.id === stored)
      ? (stored as NewsLayoutMode)
      : DEFAULT_NEWS_LAYOUT;
  });
  const [activeGalleryId, setActiveGalleryId] = useState<number | null>(null);
  const [activeFocusId, setActiveFocusId] = useState<number | null>(null);
  const [activeDrawerId, setActiveDrawerId] = useState<number | null>(null);
  const [activeAccordionId, setActiveAccordionId] = useState<number | null>(
    null
  );
  const [activeZoomId, setActiveZoomId] = useState<number | null>(null);
  const [hoveredSpotlightId, setHoveredSpotlightId] = useState<number | null>(
    null
  );
  const [carouselIndex, setCarouselIndex] = useState(0);
  const railTopRef = useRef<HTMLDivElement | null>(null);
  const railBottomRef = useRef<HTMLDivElement | null>(null);
  const railSpacerRef = useRef<HTMLDivElement | null>(null);
  const railSyncingRef = useRef<"top" | "bottom" | null>(null);
  const embeddedArchive = i18n.language.startsWith("en")
    ? (embeddedTelegramEn ?? embeddedTelegramEs)
    : embeddedTelegramEs;

  useEffect(() => {
    if (embeddedArchive) {
      setArchive(embeddedArchive as TelegramArchive);
      return;
    }
    let isMounted = true;
    const isEnglish = i18n.language.startsWith("en");
    const primaryPath = isEnglish
      ? "/telegram/messages.en.json"
      : "/telegram/messages.json";
    const fallbackPath = "/telegram/messages.json";

    const load = async () => {
      try {
        const response = await fetch(primaryPath);
        if (!response.ok) {
          if (!isEnglish) {
            throw new Error("Missing news data");
          }
          const fallbackResponse = await fetch(fallbackPath);
          if (!fallbackResponse.ok) {
            throw new Error("Missing news data");
          }
          const fallbackData =
            (await fallbackResponse.json()) as TelegramArchive;
          if (isMounted) {
            setArchive(fallbackData);
          }
          return;
        }
        const data = (await response.json()) as TelegramArchive;
        if (isMounted) {
          setArchive(data);
        }
      } catch (error_) {
        if (isMounted) {
          setError((error_ as Error).message);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [embeddedArchive, i18n.language]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("newsLayoutMode", layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    if (layoutMode !== "rail") {
      return;
    }
    const top = railTopRef.current;
    const bottom = railBottomRef.current;
    const spacer = railSpacerRef.current;
    if (!top || !bottom || !spacer) {
      return;
    }
    const syncWidths = () => {
      spacer.style.width = `${bottom.scrollWidth}px`;
    };
    syncWidths();
    window.addEventListener("resize", syncWidths);
    return () => {
      window.removeEventListener("resize", syncWidths);
    };
  }, [layoutMode, visibleCount, archive?.messages.length]);

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [i18n.language]);

  const messages = archive?.messages ?? [];
  const visibleMessages = messages.slice(0, visibleCount);

  return (
    <SectionWrapper id={SECTION_IDS.NEWS} surfaceTone="elevated">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader title={t("convention.news.title")} align="left" />
        <div className="flex flex-col items-start gap-4 md:items-end">
          <p className="max-w-md text-sm text-muted-foreground sm:text-base">
            {t("convention.news.subtitle")}
          </p>
          <div className="flex flex-wrap gap-2">
            {NEWS_LAYOUT_MODES.map((mode) => {
              const isActive = layoutMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setLayoutMode(mode.id);
                  }}
                  className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] transition ${
                    isActive
                      ? "border-accent/50 bg-accent/15 text-accent"
                      : "border-white/10 text-foreground/70 hover:border-white/30 hover:text-foreground"
                  }`}
                >
                  {t(mode.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {layoutMode === "timeline" ? (
        <div className="mt-10 space-y-6">
          {visibleMessages.map((message, index) => {
            const dateLabel = formatter.format(new Date(message.date));
            const isFeatured = index === 0;
            return (
              <div
                key={message.id}
                className="relative grid gap-4 md:grid-cols-[96px_1fr] md:items-start"
              >
                <div className="relative hidden md:flex md:h-full md:flex-col md:items-center">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_14px_rgba(201,168,76,0.6)]" />
                  <div className="mt-2 h-full w-px bg-white/10" />
                </div>
                <div className="relative">
                  <div className="absolute -left-[2.7rem] top-2 hidden h-full w-px bg-white/10 md:block" />
                  <article
                    className={`group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-surface/70 ${
                      isFeatured ? "ring-1 ring-accent/20" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                        {dateLabel}
                      </p>
                      {isFeatured && (
                        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                          {t("convention.news.featured")}
                        </span>
                      )}
                    </div>
                    {renderMedia(message)}
                    {renderText(message)}
                  </article>
                </div>
              </div>
            );
          })}
        </div>
      ) : layoutMode === "table" ? (
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-surface/60 shadow-md">
          <div className="grid grid-cols-[160px_1fr] gap-0 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <span>{t("convention.news.table.date")}</span>
            <span>{t("convention.news.table.update")}</span>
          </div>
          <div className="divide-y divide-white/10">
            {visibleMessages.map((message) => (
              <div
                key={message.id}
                className="grid grid-cols-[160px_1fr] gap-6 px-6 py-5"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  {formatter.format(new Date(message.date))}
                </p>
                <div className="flex flex-col gap-4">
                  {renderText(message)}
                  {renderMedia(message)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : layoutMode === "readmore" ? (
        <div className="mt-10 space-y-4">
          {visibleMessages.map((message) => (
            <details
              key={message.id}
              className="group rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition hover:border-white/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm text-foreground/85">
                <div className="flex flex-col gap-2">
                  <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                    {formatter.format(new Date(message.date))}
                  </p>
                  {renderPreview(message, 120)}
                </div>
                <span className="rounded-full border border-white/10 bg-surface/80 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-foreground/70 transition group-open:border-accent/50 group-open:text-accent">
                  {t("convention.news.modes.readmore")}
                </span>
              </summary>
              <div className="mt-4 flex flex-col gap-4 text-sm text-foreground/85">
                {renderMedia(message)}
                {renderText(message)}
              </div>
            </details>
          ))}
        </div>
      ) : layoutMode === "focus" ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleMessages.map((message) => {
            const isActive = activeFocusId === message.id;
            const isDim = activeFocusId !== null && !isActive;
            return (
              <article
                key={message.id}
                onClick={() => {
                  setActiveFocusId(isActive ? null : message.id);
                }}
                className={`cursor-pointer rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition ${
                  isActive ? "ring-1 ring-accent/30 scale-[1.02]" : ""
                } ${isDim ? "opacity-40 blur-[1px]" : ""}`}
              >
                <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                  {formatter.format(new Date(message.date))}
                </p>
                {renderMedia(message)}
                {renderText(message)}
              </article>
            );
          })}
        </div>
      ) : layoutMode === "drawer" ? (
        <div className="mt-10 space-y-4">
          {visibleMessages.map((message) => {
            const isOpen = activeDrawerId === message.id;
            return (
              <div
                key={message.id}
                className="rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                    {formatter.format(new Date(message.date))}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDrawerId(isOpen ? null : message.id);
                    }}
                    className="rounded-full border border-white/10 bg-surface/80 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-foreground/70 transition hover:border-white/30 hover:text-foreground"
                  >
                    {isOpen
                      ? t("convention.news.actions.close")
                      : t("convention.news.actions.open")}
                  </button>
                </div>
                <div className="mt-3">{renderPreview(message, 160)}</div>
                {isOpen && (
                  <div className="mt-4 flex flex-col gap-4">
                    {renderMedia(message)}
                    {renderText(message)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : layoutMode === "accordion" ? (
        <div className="mt-10 space-y-3">
          {visibleMessages.map((message) => {
            const isOpen = activeAccordionId === message.id;
            return (
              <div
                key={message.id}
                className="rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveAccordionId(isOpen ? null : message.id);
                  }}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                      {formatter.format(new Date(message.date))}
                    </p>
                    <div className="mt-2">{renderPreview(message, 120)}</div>
                  </div>
                  <span className="text-xl text-foreground/60">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-4 flex flex-col gap-4">
                    {renderMedia(message)}
                    {renderText(message)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : layoutMode === "zoom" ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleMessages.map((message) => (
            <article
              key={message.id}
              className="cursor-zoom-in rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition hover:border-white/30"
              onClick={() => {
                setActiveZoomId(message.id);
              }}
            >
              <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                {formatter.format(new Date(message.date))}
              </p>
              {renderMedia(message)}
              {renderText(message)}
            </article>
          ))}
        </div>
      ) : layoutMode === "spotlight" ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleMessages.map((message) => {
            const isHovered = hoveredSpotlightId === message.id;
            const isDim =
              hoveredSpotlightId !== null && hoveredSpotlightId !== message.id;
            return (
              <article
                key={message.id}
                onMouseEnter={() => {
                  setHoveredSpotlightId(message.id);
                }}
                onMouseLeave={() => {
                  setHoveredSpotlightId(null);
                }}
                className={`rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition ${
                  isHovered ? "scale-[1.03] ring-1 ring-accent/30" : ""
                } ${isDim ? "opacity-40 blur-[1px]" : ""}`}
              >
                <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                  {formatter.format(new Date(message.date))}
                </p>
                {renderMedia(message)}
                {renderText(message)}
              </article>
            );
          })}
        </div>
      ) : layoutMode === "carouselThumbs" ? (
        <div className="mt-10">
          <div className="rounded-2xl border border-white/10 bg-surface/60 p-6 shadow-md">
            {visibleMessages[carouselIndex] && (
              <div className="flex flex-col gap-4">
                <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                  {formatter.format(
                    new Date(visibleMessages[carouselIndex].date)
                  )}
                </p>
                {renderMedia(visibleMessages[carouselIndex])}
                {renderText(visibleMessages[carouselIndex])}
              </div>
            )}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCarouselIndex((previous) =>
                    previous === 0 ? visibleMessages.length - 1 : previous - 1
                  );
                }}
                className="rounded-full border border-white/10 bg-surface/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70 transition hover:border-white/30 hover:text-foreground"
              >
                ←
              </button>
              <div className="flex flex-1 gap-2 overflow-x-auto pb-2">
                {visibleMessages.map((message, index) => (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => {
                      setCarouselIndex(index);
                    }}
                    className={`min-w-[140px] rounded-xl border border-white/10 bg-surface/80 px-3 py-2 text-left text-xs text-foreground/70 transition ${
                      index === carouselIndex
                        ? "border-accent/40 text-foreground"
                        : "hover:border-white/30"
                    }`}
                  >
                    {renderPreview(message, 60)}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setCarouselIndex((previous) =>
                    previous === visibleMessages.length - 1 ? 0 : previous + 1
                  );
                }}
                className="rounded-full border border-white/10 bg-surface/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70 transition hover:border-white/30 hover:text-foreground"
              >
                →
              </button>
            </div>
          </div>
        </div>
      ) : layoutMode === "banner" ? (
        <div className="mt-10 space-y-6">
          {visibleMessages.map((message, index) => (
            <article
              key={message.id}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-surface/60 via-surface/70 to-surface/60 p-6 shadow-lg transition hover:border-white/30 ${
                index % 2 === 0 ? "lg:pr-10" : "lg:pl-10"
              }`}
            >
              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className={`${index % 2 === 0 ? "" : "lg:order-2"}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                      {formatter.format(new Date(message.date))}
                    </p>
                  </div>
                  <div className="mt-3 text-base text-foreground/85">
                    {renderText(message)}
                  </div>
                </div>
                <div className={`${index % 2 === 0 ? "" : "lg:order-1"}`}>
                  {renderMedia(message)}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : layoutMode === "rail" ? (
        <div className="mt-10 -mx-4 px-4 pb-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              {t("convention.news.modes.rail")}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  railBottomRef.current?.scrollBy({
                    left: -420,
                    behavior: "smooth",
                  });
                }}
                className="rounded-full border border-white/10 bg-surface/70 px-3 py-2 text-xs uppercase tracking-[0.2em] text-foreground/70 transition hover:border-white/30 hover:text-foreground"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => {
                  railBottomRef.current?.scrollBy({
                    left: 420,
                    behavior: "smooth",
                  });
                }}
                className="rounded-full border border-white/10 bg-surface/70 px-3 py-2 text-xs uppercase tracking-[0.2em] text-foreground/70 transition hover:border-white/30 hover:text-foreground"
              >
                →
              </button>
            </div>
          </div>
          <div
            ref={railTopRef}
            onScroll={() => {
              if (railSyncingRef.current === "bottom") {
                railSyncingRef.current = null;
                return;
              }
              const top = railTopRef.current;
              const bottom = railBottomRef.current;
              if (!top || !bottom) {
                return;
              }
              railSyncingRef.current = "top";
              bottom.scrollLeft = top.scrollLeft;
            }}
            className="news-rail-scroll mb-3 h-3 overflow-x-auto rounded-full bg-white/5"
          >
            <div ref={railSpacerRef} className="h-2 px-2" />
          </div>
          <div
            ref={railBottomRef}
            onScroll={() => {
              if (railSyncingRef.current === "top") {
                railSyncingRef.current = null;
                return;
              }
              const top = railTopRef.current;
              const bottom = railBottomRef.current;
              if (!top || !bottom) {
                return;
              }
              railSyncingRef.current = "bottom";
              top.scrollLeft = bottom.scrollLeft;
            }}
            className="news-rail-scroll overflow-x-auto pb-3"
          >
            <div className="flex w-max gap-5">
              {visibleMessages.map((message, index) => {
                const dateLabel = formatter.format(new Date(message.date));
                const isFeatured = index === 0;
                return (
                  <article
                    key={message.id}
                    className={`group relative flex w-[min(420px,85vw)] flex-none flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-surface/70 ${
                      isFeatured ? "ring-1 ring-accent/20" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                        {dateLabel}
                      </p>
                      {isFeatured && (
                        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                          {t("convention.news.featured")}
                        </span>
                      )}
                    </div>
                    {renderMedia(message)}
                    {renderText(message)}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className={`mt-10 ${getGridClassName(layoutMode)}`}>
          {visibleMessages.map((message, index) => {
            const dateLabel = formatter.format(new Date(message.date));
            const isFeatured = index === 0;
            const isMagazineHero = layoutMode === "magazine" && index % 5 === 0;
            const isMasonry = layoutMode === "masonry";
            const isPoster = layoutMode === "poster";
            const isGallery = layoutMode === "gallery";
            const isSplit = layoutMode === "split";
            const isMosaic = layoutMode === "mosaic";
            const isIndex = layoutMode === "index";
            const isLedger = layoutMode === "ledger";
            const isBillboard = layoutMode === "billboard";
            const isZigzag = layoutMode === "zigzag";
            const isDiagonal = layoutMode === "diagonal";
            const isWall = layoutMode === "wall";
            const isSlanted = layoutMode === "slanted";
            const isPolaroid = layoutMode === "polaroid";
            const mosaicSpan = getMosaicSpan(layoutMode, index);

            if (isIndex) {
              return (
                <article
                  key={message.id}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md md:grid-cols-[72px_1fr]"
                >
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-semibold text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                        {dateLabel}
                      </p>
                      {isFeatured && (
                        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                          {t("convention.news.featured")}
                        </span>
                      )}
                    </div>
                    {renderMedia(message)}
                    {renderText(message)}
                  </div>
                </article>
              );
            }

            if (isLedger) {
              return (
                <article
                  key={message.id}
                  className={`grid gap-4 rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition hover:border-white/30 ${
                    index % 2 === 0
                      ? "lg:grid-cols-[1.1fr_0.9fr]"
                      : "lg:grid-cols-[0.9fr_1.1fr]"
                  }`}
                >
                  <div className={`${index % 2 === 0 ? "" : "lg:order-2"}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                        {dateLabel}
                      </p>
                      {isFeatured && (
                        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                          {t("convention.news.featured")}
                        </span>
                      )}
                    </div>
                    {renderText(message)}
                  </div>
                  <div className={`${index % 2 === 0 ? "" : "lg:order-1"}`}>
                    {renderMedia(message)}
                  </div>
                </article>
              );
            }

            if (isBillboard) {
              return (
                <article
                  key={message.id}
                  className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-surface/60 p-6 shadow-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-surface/70 ${
                    isFeatured ? "ring-1 ring-accent/20" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                      {dateLabel}
                    </p>
                    {isFeatured && (
                      <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                        {t("convention.news.featured")}
                      </span>
                    )}
                  </div>
                  <div
                    className={`${isFeatured ? "text-base md:text-lg" : ""}`}
                  >
                    {renderText(message)}
                  </div>
                  {renderMedia(message)}
                </article>
              );
            }

            if (isZigzag) {
              return (
                <article
                  key={message.id}
                  className={`grid gap-4 rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition hover:border-white/30 lg:grid-cols-[1.2fr_0.8fr] ${
                    index % 2 === 0 ? "" : "lg:grid-cols-[0.8fr_1.2fr]"
                  }`}
                >
                  <div className={`${index % 2 === 0 ? "" : "lg:order-2"}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                        {dateLabel}
                      </p>
                    </div>
                    {renderText(message)}
                  </div>
                  <div className={`${index % 2 === 0 ? "" : "lg:order-1"}`}>
                    {renderMedia(message)}
                  </div>
                </article>
              );
            }

            if (isDiagonal) {
              return (
                <article
                  key={message.id}
                  className={`group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition hover:-translate-y-0.5 hover:border-white/30 ${
                    index % 3 === 0 ? "lg:translate-x-6" : ""
                  } ${index % 3 === 2 ? "lg:-translate-x-6" : ""}`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                      {dateLabel}
                    </p>
                  </div>
                  {renderMedia(message)}
                  {renderText(message)}
                </article>
              );
            }

            if (isWall) {
              return (
                <article
                  key={message.id}
                  className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-surface/60 p-4 shadow-md transition hover:border-white/30"
                >
                  {renderMedia(message)}
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                      {dateLabel}
                    </p>
                  </div>
                  {renderText(message)}
                </article>
              );
            }

            return (
              <article
                key={message.id}
                className={`group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-surface/60 shadow-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-surface/70 ${
                  isMasonry ? "mb-6 break-inside-avoid p-5" : "p-5"
                } ${
                  isFeatured && layoutMode !== "gallery"
                    ? "ring-1 ring-accent/20"
                    : ""
                } ${isMagazineHero ? "lg:col-span-2" : ""} ${
                  isPoster ? "overflow-hidden" : ""
                } ${isSplit ? "lg:flex-row lg:items-stretch" : ""} ${
                  isMosaic ? mosaicSpan : ""
                } ${
                  isSlanted
                    ? index % 2 === 0
                      ? "rotate-[0.6deg]"
                      : "-rotate-[0.6deg]"
                    : ""
                } ${
                  isPolaroid ? "bg-surface/80 p-4 pb-8 shadow-xl" : ""
                } ${isGallery ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (isGallery) {
                    setActiveGalleryId(message.id);
                  }
                }}
              >
                <div className={`${isSplit ? "lg:w-1/2 lg:pr-4" : ""}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                      {dateLabel}
                    </p>
                    {isFeatured && layoutMode !== "gallery" && (
                      <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                        {t("convention.news.featured")}
                      </span>
                    )}
                  </div>
                  {!isGallery && !isPoster && !isSplit && renderMedia(message)}
                  {!isGallery && renderText(message)}
                  {isGallery && !message.media?.length && (
                    <div className="mt-3 text-sm text-foreground/80">
                      {renderPreview(message, 160)}
                    </div>
                  )}
                </div>
                {(isGallery || isPoster || isSplit) && (
                  <div className={`${isSplit ? "lg:w-1/2 lg:pl-2" : ""}`}>
                    {renderMedia(message)}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {layoutMode === "gallery" && activeGalleryId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-10">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => {
              setActiveGalleryId(null);
            }}
            aria-label="Close gallery item"
          />
          <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/15 bg-surface/95 p-6 shadow-2xl backdrop-blur">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-surface/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70 transition hover:border-white/30 hover:text-foreground"
              onClick={() => {
                setActiveGalleryId(null);
              }}
            >
              Close
            </button>
            {(() => {
              const active = messages.find(
                (message) => message.id === activeGalleryId
              );
              if (!active) {
                return null;
              }
              return (
                <div className="flex flex-col gap-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                    {formatter.format(new Date(active.date))}
                  </p>
                  {renderMedia(active)}
                  {renderText(active)}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {layoutMode === "zoom" && activeZoomId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-10">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => {
              setActiveZoomId(null);
            }}
            aria-label="Close zoom item"
          />
          <div className="relative z-10 w-full max-w-4xl rounded-3xl border border-white/15 bg-surface/95 p-6 shadow-2xl backdrop-blur">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-surface/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70 transition hover:border-white/30 hover:text-foreground"
              onClick={() => {
                setActiveZoomId(null);
              }}
            >
              Close
            </button>
            {(() => {
              const active = messages.find(
                (message) => message.id === activeZoomId
              );
              if (!active) {
                return null;
              }
              return (
                <div className="flex flex-col gap-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                    {formatter.format(new Date(active.date))}
                  </p>
                  {renderMedia(active)}
                  {renderText(active)}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-6 text-sm text-muted-foreground">
          {t("convention.news.error")}
        </p>
      )}

      {messages.length > visibleCount && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setVisibleCount((count) => count + PAGE_SIZE);
            }}
            className="rounded-full border border-white/15 px-6 py-2 text-sm font-semibold text-foreground/80 transition hover:border-white/35 hover:text-foreground"
          >
            {t("convention.news.loadMore")}
          </button>
        </div>
      )}

      {archive?.source && (
        <p className="mt-6 text-xs text-muted-foreground/70">
          {t("convention.news.source")}: {archive.source}
          {archive.translatedBy && (
            <>
              {" "}
              · {t("convention.news.translatedBy")}: {archive.translatedBy}
            </>
          )}
        </p>
      )}
    </SectionWrapper>
  );
}

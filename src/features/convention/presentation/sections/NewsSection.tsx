/* eslint-disable max-lines, max-lines-per-function, sonarjs/cognitive-complexity, sonarjs/no-nested-conditional, @typescript-eslint/no-unnecessary-template-expression */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SECTION_IDS } from "@/features/convention/domain/constants";
import { cn } from "@/shared/application/utils/cn";
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
  type TelegramMessage,
} from "./news/types";
import { useNewsRenderers } from "./news/renderers";
import { buildMediaSource, isImage, isVideo } from "./news/utilities";

const INITIAL_VISIBLE = 12;
const PAGE_SIZE = 12;

const NewsCard = ({
  className,
  contentClassName,
  children,
  variant,
  ...props
}: React.ComponentProps<typeof Card> & {
  readonly contentClassName?: string;
  readonly variant?: "default" | "polaroid";
}) => (
  <Card
    className={cn(
      "rounded-2xl border-white/10 bg-surface/60 shadow-md",
      className
    )}
    variant={variant}
    {...props}
  >
    <CardContent
      className={cn(
        "p-0",
        variant === "polaroid" && "p-4 pb-10",
        contentClassName
      )}
    >
      {children}
    </CardContent>
  </Card>
);

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
      return "grid gap-6 sm:grid-cols-2";
    case "polaroidReadmore":
      return "grid gap-6 md:grid-cols-2 lg:grid-cols-3";
    case "poster":
      return "grid gap-6 md:grid-cols-2 xl:grid-cols-3";
    case "gallery":
      return "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";
    case "split":
      return "grid gap-6 lg:grid-cols-2";
    case "billboard":
      return "space-y-6";
    case "index":
      return "space-y-4";
    case "email":
      return "space-y-5";
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

const renderIndexMedia = (message: TelegramMessage, fallbackLabel: string) => {
  if (!message.media?.length) {
    return null;
  }
  const item = message.media[0];
  if (!item) {
    return null;
  }
  const source = buildMediaSource(item.path);
  if (isImage(source, item.mime)) {
    return (
      <div className="h-24 w-24 flex-none overflow-hidden rounded-xl border border-white/10 bg-surface/70 shadow">
        <img
          src={source}
          alt={item.name ?? fallbackLabel}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }
  if (isVideo(source, item.mime)) {
    return (
      <div className="flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface/70 text-xs uppercase tracking-[0.2em] text-foreground/70 shadow">
        Video
      </div>
    );
  }
  return (
    <a
      href={source}
      className="text-xs uppercase tracking-[0.2em] text-accent underline decoration-dashed underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      {item.name ?? source}
    </a>
  );
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
  const [activeEmailId, setActiveEmailId] = useState<number | null>(null);
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

  useEffect(() => {
    if (layoutMode !== "email") {
      return;
    }
    if (!visibleMessages.length) {
      return;
    }
    const firstMessage = visibleMessages[0];
    if (activeEmailId === null && firstMessage) {
      setActiveEmailId(firstMessage.id);
    }
  }, [layoutMode, visibleMessages, activeEmailId]);

  return (
    <SectionWrapper id={SECTION_IDS.NEWS} surfaceTone="deep">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t("convention.news.title")}
          align="left"
          accent="gold"
        />
        <div className="flex flex-col items-start gap-4 md:items-end">
          <p className="max-w-md text-sm text-muted-foreground sm:text-base">
            {t("convention.news.subtitle")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className="border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-foreground/70"
            >
              {t("convention.news.modeLabel")}
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={t("convention.news.actions.previous")}
                data-news-action="layout_previous"
                className="h-9 w-9 border-white/10 bg-surface/60 text-foreground/70 hover:border-white/30 hover:text-foreground"
                onClick={() => {
                  const currentIndex = NEWS_LAYOUT_MODES.findIndex(
                    (mode) => mode.id === layoutMode
                  );
                  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
                  const nextIndex =
                    (safeIndex - 1 + NEWS_LAYOUT_MODES.length) %
                    NEWS_LAYOUT_MODES.length;
                  const nextMode = NEWS_LAYOUT_MODES[nextIndex];
                  if (nextMode) {
                    setLayoutMode(nextMode.id);
                  }
                }}
              >
                <span aria-hidden="true">‹</span>
              </Button>
              <Select
                value={layoutMode}
                onValueChange={(value) => {
                  setLayoutMode(value as NewsLayoutMode);
                }}
              >
                <SelectTrigger
                  className="w-[220px] border-white/10 bg-surface/60 text-xs uppercase tracking-[0.2em]"
                  aria-label={t("convention.news.modeLabel")}
                  data-news-action="layout_change"
                >
                  <SelectValue
                    placeholder={t("convention.news.modePlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-surface">
                  {NEWS_LAYOUT_MODES.map((mode) => (
                    <SelectItem
                      key={mode.id}
                      value={mode.id}
                      className="text-xs uppercase tracking-[0.2em]"
                    >
                      {t(mode.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={t("convention.news.actions.next")}
                data-news-action="layout_next"
                className="h-9 w-9 border-white/10 bg-surface/60 text-foreground/70 hover:border-white/30 hover:text-foreground"
                onClick={() => {
                  const currentIndex = NEWS_LAYOUT_MODES.findIndex(
                    (mode) => mode.id === layoutMode
                  );
                  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
                  const nextIndex = (safeIndex + 1) % NEWS_LAYOUT_MODES.length;
                  const nextMode = NEWS_LAYOUT_MODES[nextIndex];
                  if (nextMode) {
                    setLayoutMode(nextMode.id);
                  }
                }}
              >
                <span aria-hidden="true">›</span>
              </Button>
            </div>
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
                  <NewsCard
                    className={`group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-surface/70 ${
                      isFeatured ? "ring-1 ring-accent/20" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                        {dateLabel}
                      </p>
                      {isFeatured && (
                        <Badge className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                          {t("convention.news.featured")}
                        </Badge>
                      )}
                    </div>
                    {renderMedia(message)}
                    {renderText(message)}
                  </NewsCard>
                </div>
              </div>
            );
          })}
        </div>
      ) : layoutMode === "table" ? (
        <Card className="mt-10 overflow-hidden border-white/10 bg-surface/60 shadow-md">
          <CardContent className="p-0">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <th className="px-6 py-4 font-medium">
                    {t("convention.news.table.date")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("convention.news.table.update")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleMessages.map((message) => (
                  <tr key={message.id} className="align-top text-foreground/85">
                    <td className="px-6 py-5 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {formatter.format(new Date(message.date))}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-4">
                        {renderText(message)}
                        {renderMedia(message)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : layoutMode === "email" ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.65fr] lg:items-stretch">
          <Card className="max-h-[480px] min-h-[400px] gap-0 overflow-hidden border-white/10 bg-surface/60 !py-0 shadow-md">
            <CardContent className="flex h-full flex-col p-0">
              <div className="border-b border-white/10 bg-surface/80 px-4 py-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {t("convention.news.title")}
              </div>
              <div className="news-email-scroll flex-1 overflow-y-auto">
                {visibleMessages.map((message) => {
                  const subjectLine =
                    message.text?.split("\n").find((line) => line.trim()) ??
                    t("convention.news.table.update");
                  const isActive = message.id === activeEmailId;
                  return (
                    <button
                      key={message.id}
                      type="button"
                      onClick={() => {
                        setActiveEmailId(message.id);
                      }}
                      className={`group flex w-full flex-col gap-2 border-b border-white/10 px-4 py-3 text-left transition hover:bg-surface/80 ${
                        isActive
                          ? "relative bg-surface/80 ring-1 ring-accent/20"
                          : ""
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-3 h-[calc(100%-1.5rem)] w-1 rounded-full bg-accent shadow-[0_0_12px_rgba(201,168,76,0.6)]" />
                      )}
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                          {formatter.format(new Date(message.date))}
                        </span>
                        {message.id === visibleMessages[0]?.id && (
                          <Badge className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-accent">
                            {t("convention.news.featured")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {subjectLine}
                      </p>
                      <p className="text-xs text-foreground/70">
                        {renderPreview(message, 120)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card className="max-h-[480px] min-h-[400px] overflow-hidden border-white/10 bg-surface/60 !py-0 shadow-md">
            <CardContent className="flex h-full flex-col p-0">
              {visibleMessages.map((message) => {
                if (message.id !== activeEmailId) {
                  return null;
                }
                const subjectLine =
                  message.text?.split("\n").find((line) => line.trim()) ??
                  t("convention.news.table.update");
                return (
                  <div
                    key={message.id}
                    className="news-email-scroll h-full overflow-y-auto px-5 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-foreground">
                        {subjectLine}
                      </p>
                      <Badge
                        variant="outline"
                        className="border-white/10 bg-surface/70 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-foreground/70"
                      >
                        {formatter.format(new Date(message.date))}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-5">
                      {renderMedia(message)}
                      {renderText(message)}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ) : layoutMode === "readmore" ? (
        <div className="mt-10 space-y-4">
          {visibleMessages.map((message) => {
            const isOpen = activeAccordionId === message.id;
            return (
              <NewsCard key={message.id} className="p-5">
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => {
                    setActiveAccordionId(isOpen ? null : message.id);
                  }}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex w-full items-center justify-between px-0 text-left text-sm text-foreground/85"
                    >
                      <div className="flex flex-col gap-2">
                        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                          {formatter.format(new Date(message.date))}
                        </p>
                        {renderPreview(message, 120)}
                      </div>
                      <Badge
                        variant="outline"
                        className="border-white/10 bg-surface/80 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-foreground/70"
                      >
                        {t("convention.news.modes.readmore")}
                      </Badge>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 flex flex-col gap-4 text-sm text-foreground/85">
                    {renderMedia(message)}
                    {renderText(message)}
                  </CollapsibleContent>
                </Collapsible>
              </NewsCard>
            );
          })}
        </div>
      ) : layoutMode === "polaroidReadmore" ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleMessages.map((message) => {
            const isOpen = activeAccordionId === message.id;
            const hasMedia = (message.media?.length ?? 0) > 0;
            const preview = renderPreview(message, 120);
            const mediaBlock = hasMedia ? (
              <div className="[&>div]:mt-0">{renderMedia(message)}</div>
            ) : (
              <div className="flex min-h-[11rem] items-center justify-center rounded-xl border border-white/10 bg-surface/70 p-4 text-sm text-foreground/80 shadow">
                {preview ?? (
                  <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {t("convention.news.table.update")}
                  </span>
                )}
              </div>
            );
            return (
              <NewsCard
                key={message.id}
                variant="polaroid"
                contentClassName="text-foreground"
              >
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => {
                    setActiveAccordionId(isOpen ? null : message.id);
                  }}
                >
                  <div className="flex flex-col gap-4">
                    {mediaBlock}
                    <div className="news-polaroid-caption space-y-2">
                      <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                        {formatter.format(new Date(message.date))}
                      </p>
                      {hasMedia ? preview : null}
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full justify-between border-white/10 bg-surface/80 text-[0.65rem] uppercase tracking-[0.25em] text-foreground/70 hover:border-white/30 hover:text-foreground"
                      >
                        <span>
                          {isOpen
                            ? t("convention.news.actions.close")
                            : t("convention.news.actions.open")}
                        </span>
                        <span className="text-base text-foreground/70">
                          {isOpen ? "-" : "+"}
                        </span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="flex flex-col gap-4 text-sm text-foreground/85">
                      {renderText(message)}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </NewsCard>
            );
          })}
        </div>
      ) : layoutMode === "focus" ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleMessages.map((message) => {
            const isActive = activeFocusId === message.id;
            const isDim = activeFocusId !== null && !isActive;
            return (
              <NewsCard
                key={message.id}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                data-news-action="focus_toggle"
                data-news-item-id={String(message.id)}
                onClick={() => {
                  setActiveFocusId(isActive ? null : message.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveFocusId(isActive ? null : message.id);
                  }
                }}
                className={`cursor-pointer rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none ${
                  isActive ? "ring-1 ring-accent/30 scale-[1.02]" : ""
                } ${isDim ? "opacity-40 blur-[1px]" : ""}`}
              >
                <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                  {formatter.format(new Date(message.date))}
                </p>
                {renderMedia(message)}
                {renderText(message)}
              </NewsCard>
            );
          })}
        </div>
      ) : layoutMode === "drawer" ? (
        <div className="mt-10 space-y-4">
          {visibleMessages.map((message) => {
            const isOpen = activeDrawerId === message.id;
            return (
              <NewsCard key={message.id} className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                    {formatter.format(new Date(message.date))}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-news-action="drawer_toggle"
                    data-news-item-id={String(message.id)}
                    onClick={() => {
                      setActiveDrawerId(isOpen ? null : message.id);
                    }}
                    className="rounded-full border-white/10 bg-surface/80 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-foreground/70 hover:border-white/30 hover:text-foreground"
                  >
                    {isOpen
                      ? t("convention.news.actions.close")
                      : t("convention.news.actions.open")}
                  </Button>
                </div>
                <div className="mt-3">{renderPreview(message, 160)}</div>
                {isOpen && (
                  <div className="mt-4 flex flex-col gap-4">
                    {renderMedia(message)}
                    {renderText(message)}
                  </div>
                )}
              </NewsCard>
            );
          })}
        </div>
      ) : layoutMode === "accordion" ? (
        <div className="mt-10 space-y-3">
          {visibleMessages.map((message) => {
            const isOpen = activeAccordionId === message.id;
            return (
              <NewsCard key={message.id} className="p-5">
                <Button
                  type="button"
                  variant="ghost"
                  data-news-action="accordion_toggle"
                  data-news-item-id={String(message.id)}
                  onClick={() => {
                    setActiveAccordionId(isOpen ? null : message.id);
                  }}
                  className="flex h-auto w-full items-center justify-between px-0 text-left"
                >
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                      {formatter.format(new Date(message.date))}
                    </p>
                    <div className="mt-2">{renderPreview(message, 120)}</div>
                  </div>
                  <span className="text-xl text-foreground/60">
                    {isOpen ? "-" : "+"}
                  </span>
                </Button>
                {isOpen && (
                  <div className="mt-4 flex flex-col gap-4">
                    {renderMedia(message)}
                    {renderText(message)}
                  </div>
                )}
              </NewsCard>
            );
          })}
        </div>
      ) : layoutMode === "zoom" ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleMessages.map((message) => (
            <NewsCard
              key={message.id}
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-label={t("convention.news.actions.openItem")}
              className="cursor-zoom-in rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              data-news-action="zoom_open"
              data-news-item-id={String(message.id)}
              onClick={() => {
                setActiveZoomId(message.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveZoomId(message.id);
                }
              }}
            >
              <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                {formatter.format(new Date(message.date))}
              </p>
              {renderMedia(message)}
              {renderText(message)}
            </NewsCard>
          ))}
        </div>
      ) : layoutMode === "spotlight" ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleMessages.map((message) => {
            const isHovered = hoveredSpotlightId === message.id;
            const isDim =
              hoveredSpotlightId !== null && hoveredSpotlightId !== message.id;
            return (
              <NewsCard
                key={message.id}
                onMouseEnter={() => {
                  setHoveredSpotlightId(message.id);
                }}
                onMouseLeave={() => {
                  setHoveredSpotlightId(null);
                }}
                tabIndex={0}
                onFocus={() => {
                  setHoveredSpotlightId(message.id);
                }}
                onBlur={() => {
                  setHoveredSpotlightId(null);
                }}
                className={`rounded-2xl border border-white/10 bg-surface/60 p-5 shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                  isHovered ? "scale-[1.03] ring-1 ring-accent/30" : ""
                } ${isDim ? "opacity-40 blur-[1px]" : ""}`}
              >
                <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                  {formatter.format(new Date(message.date))}
                </p>
                {renderMedia(message)}
                {renderText(message)}
              </NewsCard>
            );
          })}
        </div>
      ) : layoutMode === "carouselThumbs" ? (
        <div className="mt-10">
          <NewsCard className="overflow-hidden p-0">
            <div className="flex flex-col">
              <div className="p-6">
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
              </div>
              <div className="border-t border-white/10 bg-surface/80 px-4 py-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {t("convention.news.modes.carouselThumbs")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-news-action="carousel_prev"
                      onClick={() => {
                        setCarouselIndex((previous) =>
                          previous === 0
                            ? visibleMessages.length - 1
                            : previous - 1
                        );
                      }}
                      aria-label={t("convention.news.actions.previous")}
                      className="rounded-full border-white/10 bg-surface/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70 hover:border-white/30 hover:text-foreground"
                    >
                      &lsaquo;
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-news-action="carousel_next"
                      onClick={() => {
                        setCarouselIndex((previous) =>
                          previous === visibleMessages.length - 1
                            ? 0
                            : previous + 1
                        );
                      }}
                      aria-label={t("convention.news.actions.next")}
                      className="rounded-full border-white/10 bg-surface/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70 hover:border-white/30 hover:text-foreground"
                    >
                      &rsaquo;
                    </Button>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {visibleMessages.map((message, index) => {
                    const isActive = index === carouselIndex;
                    const preview = renderPreview(message, 80);
                    return (
                      <button
                        key={message.id}
                        type="button"
                        data-news-action="carousel_select"
                        data-news-item-id={String(message.id)}
                        onClick={() => {
                          setCarouselIndex(index);
                        }}
                        className={`group flex min-w-[220px] flex-col gap-2 rounded-2xl border border-white/10 bg-surface/70 px-4 py-3 text-left text-sm transition ${
                          isActive
                            ? "border-accent/40 bg-surface/80 shadow-[0_0_18px_rgba(201,168,76,0.2)]"
                            : "hover:border-white/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                            {formatter.format(new Date(message.date))}
                          </span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-surface/80 text-[0.6rem] font-semibold text-foreground/70">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground/90">
                          {preview ?? renderText(message)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </NewsCard>
        </div>
      ) : layoutMode === "banner" ? (
        <div className="mt-10 space-y-6">
          {visibleMessages.map((message, index) => (
            <NewsCard
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
            </NewsCard>
          ))}
        </div>
      ) : layoutMode === "rail" ? (
        <div className="mt-10 -mx-4 px-4 pb-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              {t("convention.news.modes.rail")}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-news-action="rail_prev"
                onClick={() => {
                  railBottomRef.current?.scrollBy({
                    left: -420,
                    behavior: "smooth",
                  });
                }}
                aria-label={t("convention.news.actions.previous")}
                className="rounded-full border-white/10 bg-surface/70 px-3 py-2 text-xs uppercase tracking-[0.2em] text-foreground/70 hover:border-white/30 hover:text-foreground"
              >
                &lt;
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-news-action="rail_next"
                onClick={() => {
                  railBottomRef.current?.scrollBy({
                    left: 420,
                    behavior: "smooth",
                  });
                }}
                aria-label={t("convention.news.actions.next")}
                className="rounded-full border-white/10 bg-surface/70 px-3 py-2 text-xs uppercase tracking-[0.2em] text-foreground/70 hover:border-white/30 hover:text-foreground"
              >
                &gt;
              </Button>
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
            aria-hidden="true"
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
            role="region"
            tabIndex={0}
            aria-label={t("convention.news.modes.rail")}
            className="news-rail-scroll overflow-x-auto pb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <div className="flex w-max gap-5">
              {visibleMessages.map((message, index) => {
                const dateLabel = formatter.format(new Date(message.date));
                const isFeatured = index === 0;
                return (
                  <NewsCard
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
                        <Badge className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                          {t("convention.news.featured")}
                        </Badge>
                      )}
                    </div>
                    {renderMedia(message)}
                    {renderText(message)}
                  </NewsCard>
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
            const isBillboard = layoutMode === "billboard";
            const isZigzag = layoutMode === "zigzag";
            const isDiagonal = layoutMode === "diagonal";
            const isWall = layoutMode === "wall";
            const isSlanted = layoutMode === "slanted";
            const isPolaroid = layoutMode === "polaroid";
            const mosaicSpan = getMosaicSpan(layoutMode, index);

            if (isIndex) {
              const preview = renderPreview(message, 180);
              const compactMedia = renderIndexMedia(
                message,
                t("convention.news.mediaAlt")
              );
              const isOpen = activeAccordionId === message.id;
              return (
                <NewsCard
                  key={message.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-surface/70 via-surface/60 to-surface/70 p-5 shadow-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-surface/70"
                >
                  <div className="absolute inset-y-0 left-0 hidden w-1 bg-gradient-to-b from-accent/50 via-accent/10 to-transparent md:block" />
                  <Collapsible
                    open={isOpen}
                    onOpenChange={() => {
                      setActiveAccordionId(isOpen ? null : message.id);
                    }}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
                      <div className="flex w-full items-center gap-4 md:w-auto md:flex-col md:items-center md:gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-2xl font-semibold text-accent shadow-[0_0_18px_rgba(201,168,76,0.35)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="h-px w-8 bg-white/10 md:h-8 md:w-px" />
                        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                          {dateLabel}
                        </p>
                      </div>
                      <div className="flex flex-1 flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          {isFeatured && (
                            <Badge className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                              {t("convention.news.featured")}
                            </Badge>
                          )}
                          <CollapsibleTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="ml-auto border-white/10 bg-surface/80 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-foreground/70 hover:border-white/30 hover:text-foreground"
                            >
                              {isOpen
                                ? t("convention.news.actions.close")
                                : t("convention.news.modes.readmore")}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                          {compactMedia}
                          <div className="flex-1 text-sm text-foreground/85">
                            {preview ?? renderText(message)}
                          </div>
                        </div>
                        <CollapsibleContent className="flex flex-col gap-4 text-sm text-foreground/85">
                          {renderMedia(message)}
                          {renderText(message)}
                        </CollapsibleContent>
                      </div>
                    </div>
                  </Collapsible>
                </NewsCard>
              );
            }

            if (isBillboard) {
              return (
                <NewsCard
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
                      <Badge className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                        {t("convention.news.featured")}
                      </Badge>
                    )}
                  </div>
                  <div
                    className={`${isFeatured ? "text-base md:text-lg" : ""}`}
                  >
                    {renderText(message)}
                  </div>
                  {renderMedia(message)}
                </NewsCard>
              );
            }

            if (isZigzag) {
              return (
                <NewsCard
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
                </NewsCard>
              );
            }

            if (isDiagonal) {
              return (
                <NewsCard
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
                </NewsCard>
              );
            }

            if (isWall) {
              return (
                <NewsCard
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
                </NewsCard>
              );
            }

            return (
              <NewsCard
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
                  isGallery
                    ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none"
                    : ""
                }`}
                variant={isPolaroid ? "polaroid" : "default"}
                role={isGallery ? "button" : undefined}
                tabIndex={isGallery ? 0 : undefined}
                aria-haspopup={isGallery ? "dialog" : undefined}
                aria-label={
                  isGallery ? t("convention.news.actions.openItem") : undefined
                }
                data-news-action={isGallery ? "gallery_open" : undefined}
                data-news-item-id={isGallery ? String(message.id) : undefined}
                onClick={() => {
                  if (isGallery) {
                    setActiveGalleryId(message.id);
                  }
                }}
                onKeyDown={(event) => {
                  if (!isGallery) {
                    return;
                  }
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
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
                      <Badge className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                        {t("convention.news.featured")}
                      </Badge>
                    )}
                  </div>
                  {!isGallery && !isPoster && !isSplit && renderMedia(message)}
                  {!isGallery && (
                    <div className={isPolaroid ? "news-polaroid-caption" : ""}>
                      {renderText(message)}
                    </div>
                  )}
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
              </NewsCard>
            );
          })}
        </div>
      )}

      {layoutMode === "gallery" && (
        <Dialog
          open={activeGalleryId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setActiveGalleryId(null);
            }
          }}
        >
          <DialogContent className="w-[95vw] max-w-3xl border-white/15 bg-surface/95">
            {(() => {
              const active = messages.find(
                (message) => message.id === activeGalleryId
              );
              if (!active) {
                return (
                  <DialogHeader>
                    <DialogTitle>{t("convention.news.title")}</DialogTitle>
                  </DialogHeader>
                );
              }
              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{t("convention.news.title")}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                      {formatter.format(new Date(active.date))}
                    </p>
                    {renderMedia(active)}
                    {renderText(active)}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="self-end rounded-full border-white/10 bg-surface/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70 hover:border-white/30 hover:text-foreground"
                      onClick={() => {
                        setActiveGalleryId(null);
                      }}
                    >
                      {t("convention.news.actions.close")}
                    </Button>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}

      {layoutMode === "zoom" && (
        <Dialog
          open={activeZoomId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setActiveZoomId(null);
            }
          }}
        >
          <DialogContent className="w-[95vw] max-w-4xl border-white/15 bg-surface/95">
            {(() => {
              const active = messages.find(
                (message) => message.id === activeZoomId
              );
              if (!active) {
                return (
                  <DialogHeader>
                    <DialogTitle>{t("convention.news.title")}</DialogTitle>
                  </DialogHeader>
                );
              }
              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{t("convention.news.title")}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                      {formatter.format(new Date(active.date))}
                    </p>
                    {renderMedia(active)}
                    {renderText(active)}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="self-end rounded-full border-white/10 bg-surface/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70 hover:border-white/30 hover:text-foreground"
                      onClick={() => {
                        setActiveZoomId(null);
                      }}
                    >
                      {t("convention.news.actions.close")}
                    </Button>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}

      {error && (
        <p
          className="mt-6 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {t("convention.news.error")}
        </p>
      )}

      {messages.length > visibleCount && (
        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            variant="outline"
            data-news-action="load_more"
            onClick={() => {
              setVisibleCount((count) => count + PAGE_SIZE);
            }}
            className="rounded-full border-white/15 px-6 py-2 text-sm font-semibold text-foreground/80 hover:border-white/35 hover:text-foreground"
          >
            {t("convention.news.loadMore")}
          </Button>
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

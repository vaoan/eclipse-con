import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { SECTION_IDS } from "@/features/convention/domain/constants";
import { SectionHeader } from "../components/SectionHeader";
import { SectionWrapper } from "../components/SectionWrapper";
import {
  embeddedTelegramEn,
  embeddedTelegramEs,
} from "@/features/convention/infrastructure/telegram/embedded";

type TelegramMediaItem = {
  type: string;
  path: string;
  name?: string;
  mime?: string;
  size?: number;
};

type TelegramMessage = {
  id: number;
  date: string;
  text?: string;
  media?: TelegramMediaItem[];
};

type TelegramArchive = {
  source: string;
  fetchedAt: string;
  translatedBy?: string;
  messages: TelegramMessage[];
};

const INITIAL_VISIBLE = 12;
const PAGE_SIZE = 12;

function isImage(path: string, mime?: string) {
  if (mime?.startsWith("image/")) {
    return true;
  }
  if (path.startsWith("data:image/")) {
    return true;
  }
  return /\.(png|jpe?g|webp|gif)$/i.test(path);
}

function isVideo(path: string, mime?: string) {
  if (mime?.startsWith("video/")) {
    return true;
  }
  if (path.startsWith("data:video/")) {
    return true;
  }
  return /\.(mp4|webm|mov)$/i.test(path);
}

export function NewsSection() {
  const { t, i18n } = useTranslation();
  const [archive, setArchive] = useState<TelegramArchive | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const embeddedArchive = i18n.language.startsWith("en")
    ? embeddedTelegramEn ?? embeddedTelegramEs
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
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [i18n.language]);

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
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          {t("convention.news.subtitle")}
        </p>
      </div>

      <div className="mt-12 space-y-10">
        {visibleMessages.map((message, index) => {
          const dateLabel = formatter.format(new Date(message.date));
          const isFeatured = index === 0;
          return (
            <div
              key={message.id}
              className="relative grid gap-6 md:grid-cols-[120px_1fr] md:items-start"
            >
              <div className="relative hidden md:flex md:h-full md:flex-col md:items-center">
                <div className="mt-1 h-3 w-3 rounded-full bg-accent shadow-[0_0_18px_rgba(201,168,76,0.6)]" />
                <div className="mt-2 h-full w-px bg-white/10" />
              </div>
              <div className="relative">
                <div className="absolute -left-[3.2rem] top-2 hidden h-full w-px bg-white/10 md:block" />
                <article
                  className={`group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-surface/50 p-6 shadow-lg transition hover:border-white/30 hover:bg-surface/60 ${
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
                  {message.text && (
                    <div className="space-y-3 text-sm text-foreground/85">
                      {message.text.split("\n").map((line, lineIndex) => (
                        <p key={`${message.id}-line-${lineIndex}`}>{line}</p>
                      ))}
                    </div>
                  )}
                  {message.media && message.media.length > 0 && (
                    <div className="mt-auto flex w-full flex-wrap justify-center gap-5">
                      {message.media.map((item, index) => {
                        const src =
                          item.path.startsWith("data:") ||
                          item.path.startsWith("http")
                            ? item.path
                            : item.path.startsWith("/")
                              ? item.path
                              : `/${item.path}`;
                        if (isImage(src, item.mime)) {
                          return (
                            <div
                              key={`${message.id}-media-${index}`}
                              className="flex h-80 w-full max-w-3xl items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-surface/70 shadow-lg"
                            >
                              <img
                                src={src}
                                alt={item.name ?? t("convention.news.mediaAlt")}
                                className="h-full w-full object-contain object-center transition group-hover:brightness-105"
                                loading="lazy"
                              />
                            </div>
                          );
                        }
                        if (isVideo(src, item.mime)) {
                          return (
                            <div
                              key={`${message.id}-media-${index}`}
                              className="flex h-80 w-full max-w-3xl items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-surface/70 shadow-lg"
                            >
                              <video
                                src={src}
                                controls
                                className="h-full w-full object-contain object-center"
                              />
                            </div>
                          );
                        }
                        return (
                          <a
                            key={`${message.id}-media-${index}`}
                            href={src}
                            className="text-sm text-accent underline decoration-dashed underline-offset-4"
                          >
                            {item.name ?? src}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </article>
              </div>
            </div>
          );
        })}
      </div>

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

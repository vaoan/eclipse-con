import { useTranslation } from "react-i18next";

import type { TelegramMessage } from "./types";
import { buildMediaSource, isImage, isVideo } from "./utilities";

export function useNewsRenderers() {
  const { t } = useTranslation();

  const renderMedia = (message: TelegramMessage) => {
    if (!message.media || message.media.length === 0) {
      return null;
    }
    return (
      <div className="mt-1 flex w-full flex-wrap justify-center gap-4">
        {message.media.map((item, index) => {
          const source = buildMediaSource(item.path);
          if (isImage(source, item.mime)) {
            return (
              <div
                key={`${message.id}-media-${index}`}
                className="flex h-60 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface/70 shadow"
              >
                <img
                  src={source}
                  alt={item.name ?? t("convention.news.mediaAlt")}
                  className="h-full w-full object-contain object-center transition group-hover:brightness-105"
                  loading="lazy"
                />
              </div>
            );
          }
          if (isVideo(source, item.mime)) {
            return (
              <div
                key={`${message.id}-media-${index}`}
                className="flex h-60 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface/70 shadow"
              >
                <video
                  src={source}
                  controls
                  className="h-full w-full object-contain object-center"
                />
              </div>
            );
          }
          return (
            <a
              key={`${message.id}-media-${index}`}
              href={source}
              className="text-sm text-accent underline decoration-dashed underline-offset-4"
            >
              {item.name ?? source}
            </a>
          );
        })}
      </div>
    );
  };

  const renderText = (message: TelegramMessage) => {
    if (!message.text) {
      return null;
    }
    return (
      <div className="space-y-3 text-sm text-foreground/85">
        {message.text.split("\n").map((line, lineIndex) => (
          <p key={`${message.id}-line-${lineIndex}`}>{line}</p>
        ))}
      </div>
    );
  };

  const renderPreview = (message: TelegramMessage, maxLength = 140) => {
    if (!message.text) {
      return null;
    }
    const normalized = message.text.replace(/\s+/g, " ").trim();
    const clipped =
      normalized.length > maxLength
        ? `${normalized.slice(0, maxLength)}…`
        : normalized;
    return <p className="text-sm text-foreground/85">{clipped}</p>;
  };

  return { renderMedia, renderText, renderPreview };
}

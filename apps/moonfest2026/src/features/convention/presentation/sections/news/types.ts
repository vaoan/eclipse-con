import type { NewsLayoutMode } from "@/features/convention/domain/types";

/** Represents a single media attachment on a Telegram message (photo, video, or file). */
export interface TelegramMediaItem {
  type: string;
  path: string;
  name?: string;
  mime?: string;
  size?: number;
}

/** Represents a single message exported from a Telegram channel. */
export interface TelegramMessage {
  id: number;
  date: string;
  text?: string;
  media?: TelegramMediaItem[];
}

/** Represents a full archive exported from a Telegram channel, including metadata and messages. */
export interface TelegramArchive {
  source: string;
  fetchedAt: string;
  translatedBy?: string;
  messages: TelegramMessage[];
}

export type { NewsLayoutMode };

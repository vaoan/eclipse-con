declare const __STATIC_TELEGRAM_ES__: unknown;
declare const __STATIC_TELEGRAM_EN__: unknown;

const parseEmbedded = (value: unknown) => {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  return value;
};

const resolveStaticValue = (getter: () => unknown) => {
  try {
    const value = getter();
    return typeof value === "undefined" ? null : value;
  } catch {
    return null;
  }
};

/** Parsed Spanish Telegram channel archive, embedded at build time via a Vite define plugin or env variable. */
export const embeddedTelegramEs = parseEmbedded(
  resolveStaticValue(() => __STATIC_TELEGRAM_ES__) ??
    import.meta.env.VITE_EMBED_TELEGRAM_ES
);
/** Parsed English Telegram channel archive, embedded at build time via a Vite define plugin or env variable. */
export const embeddedTelegramEn = parseEmbedded(
  resolveStaticValue(() => __STATIC_TELEGRAM_EN__) ??
    import.meta.env.VITE_EMBED_TELEGRAM_EN
);

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

export const embeddedTelegramEs = parseEmbedded(
  resolveStaticValue(() => __STATIC_TELEGRAM_ES__) ??
    import.meta.env.VITE_EMBED_TELEGRAM_ES
) as unknown;
export const embeddedTelegramEn = parseEmbedded(
  resolveStaticValue(() => __STATIC_TELEGRAM_EN__) ??
    import.meta.env.VITE_EMBED_TELEGRAM_EN
) as unknown;

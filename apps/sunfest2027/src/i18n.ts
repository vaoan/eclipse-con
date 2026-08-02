import { useCallback, useMemo, useSyncExternalStore } from "react";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

/**
 * Minimal i18n for the teaser, replacing i18next + react-i18next.
 *
 * Those two cost ~21KB gzip to provide plurals, namespaces, backends,
 * formatters and a plugin system, none of which this site uses. What it does
 * use is a dot-path lookup over two bundled JSON files, `{{name}}`
 * interpolation, and a language toggle — which is all that lives here. The
 * `useTranslation()` shape is kept identical so components read the same.
 */

/** Languages this teaser ships. */
const SUPPORTED = ["es", "en"] as const;

/** A language this teaser ships. */
type Language = (typeof SUPPORTED)[number];

/** Values substituted into a `{{placeholder}}` in a translation. */
type Variables = Record<string, string | number>;

/** Key i18next-browser-languagedetector wrote to, kept so saved choices survive. */
const STORAGE_KEY = "i18nextLng";

/** The bundled copy, keyed by language. */
const RESOURCES: Record<Language, unknown> = { es, en };

/** Narrow an arbitrary string to a language this teaser ships. */
function isSupported(value: string | null | undefined): value is Language {
  return value !== null && SUPPORTED.some((code) => code === value);
}

/**
 * Picks the starting language: an explicit `?lng=`, else a previously toggled
 * choice, else Spanish. The visitor's browser language is deliberately ignored,
 * matching the detector configuration this replaced.
 *
 * @returns The language to start in.
 */
function detectLanguage(): Language {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get("lng");
    if (isSupported(fromQuery)) {
      return fromQuery;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSupported(stored)) {
      return stored;
    }
  } catch {
    // No DOM or storage blocked: fall through to the default.
  }
  return "es";
}

/**
 * Remembers the active language, the way the detector's
 * `caches: ["localStorage"]` did.
 *
 * @param language - The language now in effect.
 */
function remember(language: Language): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Storage unavailable — the choice simply will not persist.
  }
}

let current: Language = detectLanguage();
const listeners = new Set<() => void>();

// Cache the starting language too, not just later toggles — that is what makes
// a shared `?lng=en` link stick on the next visit.
remember(current);

/** Subscribe to language changes. */
function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/** The active language. */
function getLanguage(): Language {
  return current;
}

/** The language to assume where there is no store to read (SSR, tests). */
function getDefaultLanguage(): Language {
  return "es";
}

/**
 * Switches language and notifies everything rendering copy.
 *
 * @param language - The language to switch to; unknown values are ignored.
 */
function changeLanguage(language: string): void {
  if (!isSupported(language) || language === current) {
    return;
  }
  current = language;
  remember(language);
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Resolves a dot path like `showcase.items.spa.title` against a locale object.
 *
 * @param source - The locale object to walk.
 * @param path - Dot-separated key path.
 * @returns The string found, or undefined if the path misses or is not a leaf.
 */
function lookup(source: unknown, path: string): string | undefined {
  let node: unknown = source;
  for (const step of path.split(".")) {
    if (typeof node !== "object" || node === null) {
      return undefined;
    }
    node = (node as Record<string, unknown>)[step];
  }
  return typeof node === "string" ? node : undefined;
}

/**
 * Substitutes `{{name}}` placeholders. Values are inserted verbatim — React
 * escapes them at render, which is why i18next ran with `escapeValue: false`.
 *
 * @param template - Copy that may contain placeholders.
 * @param variables - Values to substitute by name.
 * @returns The interpolated string.
 */
function interpolate(template: string, variables: Variables): string {
  return template.replaceAll(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in variables ? String(variables[name]) : match
  );
}

/**
 * Looks up copy, falling back to Spanish and then to the key itself — the same
 * order i18next was configured for, so a missing key still shows something
 * traceable rather than blank.
 *
 * @param language - Language to read.
 * @param key - Dot-path key.
 * @param variables - Optional `{{placeholder}}` values.
 * @returns The translated string.
 */
function translate(
  language: Language,
  key: string,
  variables?: Variables
): string {
  const raw = lookup(RESOURCES[language], key) ?? lookup(RESOURCES.es, key);
  if (raw === undefined) {
    return key;
  }
  return variables ? interpolate(raw, variables) : raw;
}

/** What {@link useTranslation} hands back, mirroring react-i18next's shape. */
interface Translation {
  readonly t: (key: string, variables?: Variables) => string;
  readonly i18n: {
    readonly language: Language;
    readonly resolvedLanguage: Language;
    readonly changeLanguage: (language: string) => void;
  };
}

/**
 * Copy for the active language, re-rendering the caller when it changes.
 *
 * @returns `t` for lookups plus an `i18n` handle for reading and setting the
 *   language.
 */
export function useTranslation(): Translation {
  const language = useSyncExternalStore(
    subscribe,
    getLanguage,
    getDefaultLanguage
  );

  const t = useCallback(
    (key: string, variables?: Variables) => translate(language, key, variables),
    [language]
  );

  return useMemo(
    () => ({
      t,
      i18n: { language, resolvedLanguage: language, changeLanguage },
    }),
    [t, language]
  );
}

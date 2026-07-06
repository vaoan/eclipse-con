import { environment } from "@/shared/infrastructure/config/environment";

/**
 * Structured options for generating test selector attributes.
 */
export interface TidOptionProps {
  id?: string;
  cls?: string | string[];
  vals?: Record<string, string>;
}

export const TID_ATTR = "data-testid";

/**
 * Attribute bag returned by `tid()` for stable selector metadata.
 */
type HtmlTagAttributeProps = Record<string, string>;

/**
 * Produces a destructurable object of data attributes for test selectors.
 * Returns an empty object in production unless `VITE_ENABLE_TEST_IDS=true`.
 *
 * @example
 * <button {...tid("submit-button")} />
 * <div {...tid({ id: "card", cls: "featured", vals: { status: "active" } })} />
 */
export function tid(
  idOrOptions: string | TidOptionProps
): HtmlTagAttributeProps {
  if (!environment.renderTestIds) {
    return {};
  }

  if (typeof idOrOptions === "string") {
    return { [TID_ATTR]: idOrOptions };
  }

  const options = idOrOptions;

  return {
    ...(options.id ? { [TID_ATTR]: options.id } : {}),
    ...(options.cls
      ? { "data-test-class": [options.cls].flat().join(" ") }
      : {}),
    ...(options.vals
      ? Object.fromEntries(
          Object.entries(options.vals).map(([key, value]) => [
            `data-test-${key}`,
            value,
          ])
        )
      : {}),
  };
}

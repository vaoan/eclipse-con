/**
 * Returns a `data-testid` attribute object in development; returns an empty object in production.
 * @param id - The test identifier to attach.
 * @example
 * <div {...tid("submit-button")} />
 */
export function tid(id: string) {
  if (import.meta.env.PROD) {
    return {};
  }
  return { "data-testid": id };
}

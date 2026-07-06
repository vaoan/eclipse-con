/** Return a data-testid value in dev/test, or undefined in production (stripped). */
export function tid(id: string): string | undefined {
  return import.meta.env.PROD ? undefined : id;
}

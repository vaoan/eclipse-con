export function tid(id: string) {
  if (import.meta.env.PROD) {
    return {};
  }
  return { "data-testid": id };
}

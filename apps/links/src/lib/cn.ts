import { clsx, type ClassValue } from "clsx";

/**
 * Join class names, dropping falsy ones.
 *
 * Deliberately clsx alone: this app styles itself with hand-written CSS in
 * `index.css`, so every class passed here is a custom one like `section` or
 * `is-revealed`. tailwind-merge only earns its ~8KB gzip when it has
 * conflicting Tailwind utilities to resolve, and none are ever merged here.
 *
 * @param inputs - Class values; falsy entries are skipped.
 * @returns The joined class string.
 * @example
 * cn("section", revealed && "is-revealed") // → "section is-revealed"
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names, resolving conflicts via `tailwind-merge`.
 * @example
 * cn("px-2 py-1", condition && "bg-red-500") // => "px-2 py-1 bg-red-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

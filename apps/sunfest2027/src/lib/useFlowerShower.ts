import { useSyncExternalStore } from "react";

const STORAGE_KEY = "sunfest:flower-shower";
const listeners = new Set<() => void>();

/** Read the stored flower-shower preference, defaulting to on. */
function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

/** Subscribe to flower-shower changes. */
function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** Turn the falling-flower shower on or off and notify subscribers. */
export function setFlowerShower(on: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Ignore storage failures (private mode, etc.) — state won't persist.
  }
  for (const listener of listeners) {
    listener();
  }
}

/** Whether the falling-flower shower is enabled (default on, persisted). */
export function useFlowerShower(): boolean {
  return useSyncExternalStore(subscribe, read, () => true);
}

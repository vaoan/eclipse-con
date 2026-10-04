import { useCallback, useEffect, useRef, useState } from "react";

/** State of an API read. `data` keeps the previous result while reloading. */
export interface ApiState<T> {
  readonly data: T | null;
  readonly error: unknown;
  readonly loading: boolean;
  /** Fetch again (e.g. after "Sync now"). */
  readonly reload: () => void;
}

/** What the last finished request produced, tagged with the request it answered. */
interface Settled<T> {
  readonly request: string;
  readonly data: T | null;
  readonly error: unknown;
}

/**
 * Loads data whenever `key` changes, aborting stale requests. Holds the last
 * good result during a refetch so charts dim instead of flashing; `loading` is
 * derived (the settled request is not the current one), so no state is set
 * synchronously inside the effect.
 *
 * @param load - Fetcher receiving an AbortSignal.
 * @param key - Re-fetch whenever this string changes.
 * @returns Data, error, loading flag and a reload function.
 */
export function useApi<T>(
  load: (signal: AbortSignal) => Promise<T>,
  key: string
): ApiState<T> {
  const [nonce, setNonce] = useState(0);
  const [settled, setSettled] = useState<Settled<T>>({
    request: "",
    data: null,
    error: null,
  });
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  const request = `${key}#${String(nonce)}`;

  useEffect(() => {
    const controller = new AbortController();
    loadRef
      .current(controller.signal)
      .then((data) => {
        setSettled({ request, data, error: null });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setSettled((previous) => ({ request, data: previous.data, error }));
        }
      });
    return () => {
      controller.abort();
    };
  }, [request]);

  const reload = useCallback(() => {
    setNonce((value) => value + 1);
  }, []);

  return {
    data: settled.data,
    error: settled.error,
    loading: settled.request !== request,
    reload,
  };
}

"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media queries as an external store. The server snapshot is always `false`, so
 * anything gated on a query renders absent on the server and mounts only after
 * hydration confirms it. That is what lets the hero skip fetching video
 * entirely on phones and for readers who ask for reduced motion, rather than
 * loading it and then hiding it.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    useCallback(() => window.matchMedia(query).matches, [query]),
    () => false,
  );
}

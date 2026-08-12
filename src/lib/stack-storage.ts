const STORAGE_KEY = "peptidepedia:stack";

/**
 * localStorage exposed as a React external store, so the stack builder can read
 * persisted state without restoring it through an effect. `useSyncExternalStore`
 * handles the server/client snapshot split, which is what keeps hydration clean
 * when the server has no storage to read.
 */
const listeners = new Set<() => void>();
let snapshot: string | null = null;
let initialised = false;

function read(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private browsing or a blocked storage quota. The builder still works, it
    // just will not remember anything between visits.
    return null;
  }
}

export function subscribeToStack(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStackSnapshot(): string | null {
  if (!initialised) {
    snapshot = read();
    initialised = true;
  }
  return snapshot;
}

/** Server render has no storage; returning null makes the caller fall back. */
export function getStackServerSnapshot(): string | null {
  return null;
}

export function writeStack(value: string): void {
  snapshot = value;
  initialised = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Same as above - in-memory snapshot still drives the current session.
  }
  for (const listener of listeners) listener();
}

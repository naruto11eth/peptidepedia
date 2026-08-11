export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "peptidepedia:theme";

/**
 * Runs before first paint via a blocking inline script so an explicit theme
 * choice is applied to <html> before the browser paints. Without it, a visitor
 * who chose light mode sees a dark flash on every navigation.
 *
 * No stored preference means no attribute, which leaves the page on
 * prefers-color-scheme. That is the default, not a fallback.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}})()`;

const listeners = new Set<() => void>();
let snapshot: Theme | null = null;
let initialised = false;

function currentTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getThemeSnapshot(): Theme {
  if (!initialised) {
    snapshot = currentTheme();
    initialised = true;
  }
  return snapshot ?? "dark";
}

/** The server cannot know the visitor's preference; the toggle renders neutral until hydration. */
export function getThemeServerSnapshot(): Theme {
  return "dark";
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  snapshot = theme;
  initialised = true;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked; the choice still applies for this page view.
  }
  for (const listener of listeners) listener();
}

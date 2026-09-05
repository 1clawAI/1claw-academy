"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";
const KEY = "1claw-academy:theme";
const EVENT = "1claw-academy:themechange";

/** Runs before paint to stamp the saved theme, so there is no flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  KEY,
)});if(!t){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

// The theme lives on <html>, written before hydration by the script above.
// useSyncExternalStore is the right way to read that external value without
// a setState-in-effect round trip.
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}
function getSnapshot(): Theme {
  return (
    (document.documentElement.getAttribute("data-theme") as Theme) ?? "dark"
  );
}
function getServerSnapshot(): Theme {
  return "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode — the choice just will not persist */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--hover)] hover:text-[var(--foreground)]"
    >
      {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  );
}

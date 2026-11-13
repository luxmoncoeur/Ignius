"use client";

import { useCallback, useSyncExternalStore } from "react";

// The theme lives on <html data-theme>, set before paint by the inline script
// in app/layout.jsx. Components subscribe to that attribute directly.
function subscribe(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const read = () => document.documentElement.dataset.theme || "light";

/** [theme, toggle]; theme is null during server render. */
export default function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => null);
  const toggle = useCallback(() => {
    const next = read() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("calphy-theme", next);
    } catch {
      /* private mode */
    }
  }, []);
  return [theme, toggle];
}

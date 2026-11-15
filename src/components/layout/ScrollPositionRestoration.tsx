"use client";

import { useLayoutEffect } from "react";

type SavedPosition = { x: number; y: number };

/** Keep a same-tab page's scroll position when the browser reloads it. */
export function ScrollPositionRestoration(): null {
  useLayoutEffect(() => {
    const key = `spsatt:scroll:${window.location.pathname}${window.location.search}`;
    const navigation = performance.getEntriesByType("navigation").at(0) as
      | PerformanceNavigationTiming
      | undefined;
    const isReload = navigation?.type === "reload";

    const savePosition = () => {
      try {
        sessionStorage.setItem(
          key,
          JSON.stringify({ x: window.scrollX, y: window.scrollY }),
        );
      } catch {
        // Scroll restoration is a convenience; storage may be unavailable.
      }
    };

    if (isReload && !window.location.hash) {
      try {
        const saved = sessionStorage.getItem(key);
        if (saved) {
          const position = JSON.parse(saved) as SavedPosition;
          if (Number.isFinite(position.x) && Number.isFinite(position.y)) {
            window.scrollTo({
              left: position.x,
              top: position.y,
              behavior: "instant",
            });
          }
        }
      } catch {
        // Ignore invalid or unavailable session storage.
      }
    }

    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    const handleScroll = () => {
      if (saveTimer) return;
      saveTimer = setTimeout(() => {
        saveTimer = undefined;
        savePosition();
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", savePosition);

    return () => {
      if (saveTimer) clearTimeout(saveTimer);
      savePosition();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", savePosition);
    };
  }, []);

  return null;
}

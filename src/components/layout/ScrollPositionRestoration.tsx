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

    let savedPosition: SavedPosition | undefined;
    if (isReload && !window.location.hash) {
      try {
        const saved = sessionStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved) as SavedPosition;
          if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
            savedPosition = parsed;
          }
        }
      } catch {
        // Ignore invalid or unavailable session storage.
      }
    }

    let resizeObserver: ResizeObserver | undefined;
    let mutationObserver: MutationObserver | undefined;
    let restoreDeadline: ReturnType<typeof setTimeout> | undefined;
    let restoreFrame = 0;
    let restoring = Boolean(savedPosition);

    const stopRestoring = () => {
      if (!restoring) return;
      restoring = false;
      cancelAnimationFrame(restoreFrame);
      if (restoreDeadline) clearTimeout(restoreDeadline);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("load", scheduleRestore);
      window.removeEventListener("wheel", cancelRestore);
      window.removeEventListener("touchstart", cancelRestore);
      window.removeEventListener("keydown", cancelRestore);
    };

    const attemptRestore = () => {
      if (!restoring || !savedPosition) return;

      const maxScrollY =
        document.documentElement.scrollHeight - window.innerHeight;
      // Wait until streamed/hydrated content makes the stored position
      // reachable; scrolling earlier would clamp it to the current page end.
      if (maxScrollY < savedPosition.y) return;

      window.scrollTo({
        left: savedPosition.x,
        top: savedPosition.y,
        behavior: "instant",
      });
      if (Math.abs(window.scrollY - savedPosition.y) < 2) stopRestoring();
    };

    function scheduleRestore() {
      if (!restoring || restoreFrame) return;
      restoreFrame = requestAnimationFrame(() => {
        restoreFrame = 0;
        attemptRestore();
      });
    }

    function cancelRestore(event: Event) {
      if (
        event.type !== "keydown" ||
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(
          (event as KeyboardEvent).key,
        )
      ) {
        stopRestoring();
        savePosition();
      }
    }

    if (restoring) {
      resizeObserver = new ResizeObserver(scheduleRestore);
      resizeObserver.observe(document.documentElement);
      mutationObserver = new MutationObserver(scheduleRestore);
      mutationObserver.observe(document.body, { childList: true, subtree: true });
      window.addEventListener("load", scheduleRestore, { once: true });
      window.addEventListener("wheel", cancelRestore, { passive: true, once: true });
      window.addEventListener("touchstart", cancelRestore, { passive: true, once: true });
      window.addEventListener("keydown", cancelRestore);
      restoreDeadline = setTimeout(stopRestoring, 10_000);
      scheduleRestore();
    }

    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    const handleScroll = () => {
      if (restoring) return;
      if (saveTimer) return;
      saveTimer = setTimeout(() => {
        saveTimer = undefined;
        savePosition();
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", savePosition);
    document.addEventListener("visibilitychange", saveWhenHidden);

    function saveWhenHidden() {
      if (document.visibilityState === "hidden") savePosition();
    }

    return () => {
      if (saveTimer) clearTimeout(saveTimer);
      stopRestoring();
      savePosition();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", savePosition);
      document.removeEventListener("visibilitychange", saveWhenHidden);
    };
  }, []);

  return null;
}

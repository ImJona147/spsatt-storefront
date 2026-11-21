"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { StorefrontBanner as Banner } from "@/lib/data/storefront-banners";

export function StorefrontBanner({
  banners,
  basePath,
  locale,
}: {
  banners: Banner[];
  basePath: string;
  locale: string;
}) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    try {
      setDismissed(
        banners
          .filter(
            (b) =>
              b.dismissible &&
              localStorage.getItem(
                `storefront-banner:${b.id}:${b.updated_at}`,
              ) === "dismissed",
          )
          .map((b) => b.id),
      );
    } catch {
      /* Storage is optional. */
    }
    setReady(true);
  }, [banners]);
  const visible = banners.filter((b) => !dismissed.includes(b.id));
  const banner = visible[index % Math.max(1, visible.length)];
  useEffect(() => {
    if (
      !banner?.autoplay ||
      paused ||
      hovered ||
      visible.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setInterval(() => setIndex((i) => i + 1), 6000);
    return () => clearInterval(timer);
  }, [banner?.autoplay, paused, hovered, visible.length]);
  if (!ready || !banner) return null;
  const es = locale === "es";
  const move = (delta: number) => {
    setPaused(true);
    setIndex((i) => (i + delta + visible.length) % visible.length);
  };
  const action = (
    path: string | null,
    label: string | null,
    primary: boolean,
  ) =>
    path?.startsWith("/") && label ? (
      <Link
        href={`${basePath}${path}`}
        className={
          primary
            ? "inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-slate-950 transition-opacity hover:opacity-85"
            : "inline-flex min-h-9 items-center rounded-full border border-current px-4 text-xs font-semibold hover:opacity-80"
        }
      >
        {label}
        {primary && <ArrowRight className="size-3.5" aria-hidden="true" />}
      </Link>
    ) : null;
  return (
    <aside
      aria-label={es ? "Avisos de la tienda" : "Store announcements"}
      className={`${banner.sticky ? "sticky top-0 z-50" : "relative"} w-full border-b border-black/10`}
      style={{
        backgroundColor: banner.background_color,
        color: banner.text_color,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setHovered(false);
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:px-6">
        {visible.length > 1 && (
          <button
            type="button"
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
            aria-label={es ? "Aviso anterior" : "Previous announcement"}
            onClick={() => move(-1)}
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
        <div
          key={banner.id}
          className={`flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-5 gap-y-2 py-1 ${banner.animation === "none" ? "" : banner.animation === "fade" ? "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" : "motion-safe:animate-in motion-safe:slide-in-from-right-4 motion-safe:fade-in motion-safe:duration-300"}`}
        >
          <div className="text-center text-sm">
            <strong className="font-semibold">{banner.title}</strong>
            {banner.message && (
              <span className="ml-2 opacity-90">{banner.message}</span>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {action(banner.link_path, banner.link_label, true)}
            {action(banner.secondary_path, banner.secondary_label, false)}
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          {visible.length > 1 && (
            <>
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-full hover:bg-white/10"
                aria-label={es ? "Aviso siguiente" : "Next announcement"}
                onClick={() => move(1)}
              >
                <ChevronRight className="size-4" />
              </button>
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-full hover:bg-white/10"
                aria-label={
                  paused
                    ? es
                      ? "Reanudar"
                      : "Resume"
                    : es
                      ? "Pausar"
                      : "Pause"
                }
                onClick={() => setPaused(!paused)}
              >
                {paused ? (
                  <Play className="size-3.5" />
                ) : (
                  <Pause className="size-3.5" />
                )}
              </button>
            </>
          )}
          {banner.dismissible && (
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full hover:bg-white/10"
              aria-label={es ? "Cerrar aviso" : "Dismiss announcement"}
              onClick={() => {
                setDismissed((ids) => [...ids, banner.id]);
                try {
                  localStorage.setItem(
                    `storefront-banner:${banner.id}:${banner.updated_at}`,
                    "dismissed",
                  );
                } catch {
                  /* Storage is optional. */
                }
              }}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

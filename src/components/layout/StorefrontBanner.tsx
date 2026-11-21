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
        <section
          className="min-w-0 flex-1 overflow-hidden"
          aria-label={es ? "Carrusel de avisos" : "Announcement carousel"}
          aria-roledescription={es ? "carrusel" : "carousel"}
        >
          <div
            className={
              banner.animation === "slide"
                ? "flex items-stretch transition-transform duration-500 ease-in-out motion-reduce:transition-none"
                : "grid"
            }
            style={
              banner.animation === "slide"
                ? {
                    transform: `translate3d(-${(index % visible.length) * 100}%, 0, 0)`,
                  }
                : undefined
            }
            aria-live={paused || !banner.autoplay ? "polite" : "off"}
          >
            {visible.map((slide, slideIndex) => {
              const active = slideIndex === index % visible.length;
              return (
                <div
                  key={slide.id}
                  aria-hidden={!active}
                  inert={!active}
                  className={
                    banner.animation === "slide"
                      ? "flex w-full shrink-0 flex-wrap items-center justify-center gap-x-5 gap-y-2 px-2 py-2"
                      : `col-start-1 row-start-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-2 py-2 ${banner.animation === "fade" ? "transition-opacity duration-500 motion-reduce:transition-none" : ""} ${active ? "opacity-100" : "pointer-events-none opacity-0"}`
                  }
                >
                  <div className="text-center text-sm">
                    <strong className="font-semibold">{slide.title}</strong>
                    {slide.message && (
                      <span className="ml-2 opacity-90">{slide.message}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {action(slide.link_path, slide.link_label, true)}
                    {action(slide.secondary_path, slide.secondary_label, false)}
                  </div>
                </div>
              );
            })}
          </div>
          {visible.length > 1 && (
            <fieldset
              className="flex justify-center gap-1"
              aria-label={es ? "Seleccionar aviso" : "Select announcement"}
            >
              {visible.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  className="flex size-6 items-center justify-center"
                  aria-label={`${slideIndex + 1}: ${slide.title}`}
                  aria-current={
                    slideIndex === index % visible.length ? "true" : undefined
                  }
                  onClick={() => {
                    setPaused(true);
                    setIndex(slideIndex);
                  }}
                >
                  <span
                    className={`h-1 rounded-full bg-current transition-[width,opacity] motion-reduce:transition-none ${slideIndex === index % visible.length ? "w-4 opacity-100" : "w-1 opacity-40"}`}
                  />
                </button>
              ))}
            </fieldset>
          )}
        </section>
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

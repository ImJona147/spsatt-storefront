"use client";

import type { Media } from "@spree/sdk";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const SWIPE_THRESHOLD_PX = 50;
const SWIPE_MAX_VERTICAL_PX = 75;
const MAX_SCALE = 4;
const ZOOM_STEP = 1.6;
const TAP_MOVE_TOLERANCE_PX = 10;

interface ZoomTransform {
  scale: number;
  x: number;
  y: number;
}

const IDENTITY: ZoomTransform = { scale: 1, x: 0, y: 0 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Keeps the panning offset inside the scaled image so its edges never
 * drift away from the viewport. */
function clampTransform(
  transform: ZoomTransform,
  surface: HTMLElement | null,
): ZoomTransform {
  if (transform.scale <= 1) return IDENTITY;
  const maxX = surface ? ((transform.scale - 1) * surface.offsetWidth) / 2 : 0;
  const maxY = surface ? ((transform.scale - 1) * surface.offsetHeight) / 2 : 0;
  return {
    scale: transform.scale,
    x: clamp(transform.x, -maxX, maxX),
    y: clamp(transform.y, -maxY, maxY),
  };
}

function pointerDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

interface ZoomableImageProps {
  src: string;
  alt: string;
  canNavigate: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * The image surface: single tap/click, pinch and the +/- buttons scale up to
 * 4x; dragging pans while zoomed. Swipe navigation
 * only runs at 1x, so a pan never changes the slide by accident.
 *
 * The parent remounts this with a key per slide, which resets the zoom
 * whenever the lightbox navigates.
 */
function ZoomableImage({
  src,
  alt,
  canNavigate,
  onPrev,
  onNext,
}: ZoomableImageProps) {
  const t = useTranslations("products");
  const surfaceRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const panRef = useRef<{
    startX: number;
    startY: number;
    x: number;
    y: number;
  } | null>(null);
  const didPinchRef = useRef(false);
  const [zoom, setZoom] = useState<ZoomTransform>(IDENTITY);
  const [dragging, setDragging] = useState(false);

  const zoomed = zoom.scale > 1;

  const setScale = (scale: number) => {
    setZoom((previous) =>
      clampTransform(
        { ...previous, scale: clamp(scale, 1, MAX_SCALE) },
        surfaceRef.current,
      ),
    );
  };

  const toggleZoom = () => {
    setZoom((previous) =>
      previous.scale > 1
        ? IDENTITY
        : clampTransform({ scale: 2.5, x: 0, y: 0 }, surfaceRef.current),
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 1) {
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        x: zoom.x,
        y: zoom.y,
      };
    } else if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      pinchRef.current = { distance: pointerDistance(a, b), scale: zoom.scale };
      panRef.current = null;
      didPinchRef.current = true;
      setDragging(false);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [a, b] = [...pointersRef.current.values()];
      const ratio = pointerDistance(a, b) / pinchRef.current.distance;
      setScale(pinchRef.current.scale * ratio);
      return;
    }

    if (pointersRef.current.size === 1 && panRef.current && zoom.scale > 1) {
      const origin = panRef.current;
      const dx = e.clientX - origin.startX;
      const dy = e.clientY - origin.startY;
      setDragging(true);
      setZoom((previous) =>
        clampTransform(
          { scale: previous.scale, x: origin.x + dx, y: origin.y + dy },
          surfaceRef.current,
        ),
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size > 0) return;

    const pan = panRef.current;
    panRef.current = null;
    setDragging(false);

    if (didPinchRef.current) {
      didPinchRef.current = false;
      return;
    }
    if (!pan) return;

    const dx = e.clientX - pan.startX;
    const dy = e.clientY - pan.startY;
    const isTap =
      Math.abs(dx) < TAP_MOVE_TOLERANCE_PX &&
      Math.abs(dy) < TAP_MOVE_TOLERANCE_PX;

    if (isTap) {
      toggleZoom();
      return;
    }

    if (zoom.scale > 1 || !canNavigate) return;
    if (
      Math.abs(dx) < SWIPE_THRESHOLD_PX ||
      Math.abs(dy) > SWIPE_MAX_VERTICAL_PX
    ) {
      return;
    }
    if (dx < 0) {
      onNext();
    } else {
      onPrev();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size > 0) return;
    pinchRef.current = null;
    panRef.current = null;
    didPinchRef.current = false;
    setDragging(false);
  };

  return (
    <div
      ref={surfaceRef}
      className="media-lightbox-image relative m-4 h-full max-h-[85svh] w-full max-w-5xl touch-none select-none overflow-hidden"
      style={{
        cursor: zoomed ? (dragging ? "grabbing" : "grab") : "zoom-in",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onDoubleClick={toggleZoom}
    >
      <div
        className={`absolute inset-0 will-change-transform ${
          dragging
            ? ""
            : "transition-transform duration-200 motion-reduce:transition-none"
        }`}
        style={{
          transform: `translate3d(${zoom.x}px, ${zoom.y}px, 0) scale(${zoom.scale})`,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain pointer-events-none"
          sizes="100vw"
          quality={85}
        />
      </div>

      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
        <button
          type="button"
          className="min-h-11 min-w-11 rounded-lg border border-border bg-background/90 p-2.5 text-foreground transition-colors hover:bg-accent disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={(e) => {
            e.stopPropagation();
            setScale(zoom.scale * ZOOM_STEP);
          }}
          disabled={zoom.scale >= MAX_SCALE}
          aria-label={t("lightboxZoomIn")}
        >
          <ZoomIn className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="min-h-11 min-w-11 rounded-lg border border-border bg-background/90 p-2.5 text-foreground transition-colors hover:bg-accent disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={(e) => {
            e.stopPropagation();
            setScale(zoom.scale / ZOOM_STEP);
          }}
          disabled={!zoomed}
          aria-label={t("lightboxZoomOut")}
        >
          <ZoomOut className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

interface MediaLightboxProps {
  images: Media[];
  activeIndex: number;
  productName: string;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

/**
 * Fullscreen image lightbox. Lazy-loaded from MediaGallery so its
 * keyboard handlers, navigation UI, and next/image full-size render
 * don't ship in the initial product page bundle.
 *
 * Exposed as a real modal dialog (role="dialog", aria-modal="true") with
 * focus moved to the close button on open and restored on close so
 * screen-reader and keyboard users can't get stuck in the page behind
 * the overlay.
 *
 * The full-size source is the original upload, not Spree's square-cropped
 * xlarge rendition, so zooming shows the framing the merchant uploaded.
 */
export function MediaLightbox({
  images,
  activeIndex,
  productName,
  onClose,
  onNavigate,
}: MediaLightboxProps): React.ReactElement | null {
  const t = useTranslations("products");
  const current = images[activeIndex];
  const src =
    current?.original_url || current?.xlarge_url || current?.large_url || null;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const closeViewer = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(onClose, 160);
  }, [isClosing, onClose]);
  // Tracks whether a pointerdown happened on the backdrop itself (vs.
  // bubbled up from a child). Without this, the synthetic click fired
  // by the opening tap on the parent <button> in MediaGallery lands on
  // the freshly-mounted backdrop and immediately closes the lightbox
  // on mobile.
  const pressedOnBackdropRef = useRef(false);

  const goPrev = useCallback(() => {
    onNavigate(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  }, [activeIndex, images.length, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, images.length, onNavigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closeViewer, goPrev, goNext]);

  // Focus management: capture the previously focused element when the
  // lightbox mounts, move focus into the dialog, then restore it on
  // unmount so keyboard users return to the element that opened it.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  useLayoutEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const currentPaddingRight = Number.parseFloat(
      window.getComputedStyle(document.body).paddingRight,
    );

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  if (!src) return null;

  // Portaled to <body>: the gallery wrapper is `position: sticky`, which
  // creates a stacking context, so an in-place fixed overlay would paint
  // underneath the site header (also z-50) instead of above it.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("openImageZoom")}
      data-state={isClosing ? "closing" : "open"}
      className="media-lightbox fixed inset-0 z-[100] flex items-center justify-center bg-background"
      onPointerDown={(e) => {
        pressedOnBackdropRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pressedOnBackdropRef.current) {
          closeViewer();
        }
        pressedOnBackdropRef.current = false;
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-10 min-h-11 min-w-11 rounded-lg border border-border bg-background/90 p-2.5 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={(e) => {
          e.stopPropagation();
          closeViewer();
        }}
        aria-label={t("lightboxClose")}
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-4 top-1/2 z-10 min-h-11 min-w-11 -translate-y-1/2 rounded-lg border border-border bg-background/90 p-2.5 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label={t("lightboxPrev")}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="absolute right-4 top-1/2 z-10 min-h-11 min-w-11 -translate-y-1/2 rounded-lg border border-border bg-background/90 p-2.5 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label={t("lightboxNext")}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </>
      )}

      <ZoomableImage
        key={activeIndex}
        src={src}
        alt={current?.alt || productName}
        canNavigate={images.length > 1}
        onPrev={goPrev}
        onNext={goNext}
      />

      {images.length > 1 && (
        <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-lg border border-border bg-background/90 px-3 py-1 text-sm tabular-nums text-foreground">
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>,
    document.body,
  );
}

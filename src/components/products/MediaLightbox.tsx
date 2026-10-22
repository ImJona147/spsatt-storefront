"use client";

import type { Media } from "@spree/sdk";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const SWIPE_THRESHOLD_PX = 50;
const SWIPE_MAX_VERTICAL_PX = 75;

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
    current?.xlarge_url || current?.large_url || current?.original_url || null;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start || images.length <= 1) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (
        Math.abs(dx) < SWIPE_THRESHOLD_PX ||
        Math.abs(dy) > SWIPE_MAX_VERTICAL_PX
      ) {
        return;
      }
      // Swallow the synthetic backdrop click that follows touchend so a
      // swipe navigates without also dismissing the lightbox.
      pressedOnBackdropRef.current = false;
      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
    },
    [goNext, goPrev, images.length],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goPrev, goNext]);

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

  // Lock background scroll while the overlay is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
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
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center touch-pan-y"
      onPointerDown={(e) => {
        pressedOnBackdropRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pressedOnBackdropRef.current) {
          onClose();
        }
        pressedOnBackdropRef.current = false;
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className="absolute z-10 text-white p-3 hover:bg-white/10 rounded-lg transition-colors top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))]"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={t("lightboxClose")}
      >
        <X className="w-8 h-8" aria-hidden="true" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white p-3 hover:bg-white/10 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label={t("lightboxPrev")}
          >
            <ChevronLeft className="w-8 h-8" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white p-3 hover:bg-white/10 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label={t("lightboxNext")}
          >
            <ChevronRight className="w-8 h-8" aria-hidden="true" />
          </button>
        </>
      )}

      <div className="relative w-full h-full max-w-5xl max-h-[85svh] m-4">
        <Image
          src={src}
          alt={current?.alt || productName}
          fill
          className="object-contain pointer-events-none"
          sizes="100vw"
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-lg text-sm tabular-nums">
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>,
    document.body,
  );
}

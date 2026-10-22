"use client";

import type { Media } from "@spree/sdk";
import { ZoomIn } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { ProductImage } from "@/components/ui/product-image";

const SWIPE_THRESHOLD_PX = 50;
const SWIPE_MAX_VERTICAL_PX = 75;

/** Tiny 10×10 neutral gray PNG used as a blur placeholder while images load. */
const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIElEQVQYV2P4////MwwMDAxMDAwMDGQJMJCvkGwNZCsEAGebBwVss9lRAAAAAElFTkSuQmCC";

/** Lazy-loaded lightbox — only pulled into the bundle when a user zooms. */
const LazyMediaLightbox = dynamic(
  () =>
    import("@/components/products/MediaLightbox").then((mod) => ({
      default: mod.MediaLightbox,
    })),
  {
    ssr: false,
    // Minimal fullscreen overlay so the zoom click gives immediate
    // feedback on slow networks while the chunk downloads.
    loading: () => (
      <div className="fixed inset-0 z-[100] bg-black/90" aria-hidden="true" />
    ),
  },
);

interface MediaGalleryProps {
  images: Media[];
  productName: string;
  activeIndex?: number | null;
}

/** Prefer pre-sized Spree media URLs over the full-resolution original,
 * so the Next.js image optimizer doesn't have to fetch the source file. */
function getMainImageUrl(media: Media | undefined): string | null {
  if (!media) return null;
  return media.xlarge_url || media.large_url || media.original_url || null;
}

function getThumbImageUrl(media: Media | undefined): string | null {
  if (!media) return null;
  return media.small_url || media.mini_url || media.original_url || null;
}

export function MediaGallery(props: MediaGalleryProps) {
  // Reset internal state when the parent changes activeIndex by rekeying.
  // Avoids the useEffect-to-sync-prop antipattern.
  return <MediaGalleryInner key={props.activeIndex ?? "default"} {...props} />;
}

function MediaGalleryInner({
  images,
  productName,
  activeIndex,
}: MediaGalleryProps) {
  const t = useTranslations("products");
  const [selectedIndex, setSelectedIndex] = useState(activeIndex ?? 0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mainImageErrorUrl, setMainImageErrorUrl] = useState<string | null>(
    null,
  );

  const safeIndex = Math.max(0, Math.min(selectedIndex, images.length - 1));

  // Horizontal swipe on the main image navigates between media. When a
  // swipe is detected we suppress the synthetic click so the lightbox
  // doesn't open from the same gesture.
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    suppressClickRef.current = false;
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
      suppressClickRef.current = true;
      const nextIndex =
        dx < 0
          ? (safeIndex + 1) % images.length
          : (safeIndex - 1 + images.length) % images.length;
      setSelectedIndex(nextIndex);
      setMainImageErrorUrl(null);
    },
    [images.length, safeIndex],
  );

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
        <ProductImage
          src={null}
          alt={productName}
          fill
          iconClassName="w-24 h-24"
        />
      </div>
    );
  }

  const selectImage = (index: number) => {
    setSelectedIndex(index);
    setMainImageErrorUrl(null);
  };

  const selectedImage = images[safeIndex];
  const mainImageUrl = getMainImageUrl(selectedImage);
  const showMainImage = mainImageUrl && mainImageErrorUrl !== mainImageUrl;

  const thumbnails = (
    <>
      {images.map((image, index) => {
        const thumbUrl = getThumbImageUrl(image);
        return (
          <button
            type="button"
            key={image.id}
            onClick={() => selectImage(index)}
            aria-label={`${productName} ${index + 1}`}
            aria-current={index === safeIndex}
            className={`relative w-16 h-16 lg:w-[4.5rem] lg:h-[4.5rem] flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors bg-muted ${
              index === safeIndex
                ? "border-primary"
                : "border-transparent hover:border-border"
            }`}
          >
            <ProductImage
              src={thumbUrl}
              alt={image.alt || `${productName} ${index + 1}`}
              fill
              className="object-cover"
              sizes="72px"
            />
          </button>
        );
      })}
    </>
  );

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-start lg:gap-4">
      {/* Thumbnail rail: horizontal strip on mobile, vertical column on desktop */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:pb-0 lg:overflow-visible">
          {thumbnails}
        </div>
      )}

      {/* Main image, framed on a washed surface so it reads as an object,
          not a banner swallowing the column */}
      <div className="relative min-w-0 flex-1">
        <button
          type="button"
          className="relative aspect-square bg-muted rounded-xl border border-border overflow-hidden cursor-zoom-in w-full touch-pan-y"
          onClick={() => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              return;
            }
            if (showMainImage) setIsZoomed(true);
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label={t("openImageZoom")}
          disabled={!showMainImage}
        >
          <ProductImage
            key={safeIndex}
            src={mainImageUrl}
            alt={selectedImage?.alt || productName}
            fill
            className="object-contain p-4"
            fetchPriority="high"
            loading="eager"
            priority
            quality={85}
            sizes="(max-width: 1024px) 100vw, 40vw"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            iconClassName="w-24 h-24"
            onError={() => mainImageUrl && setMainImageErrorUrl(mainImageUrl)}
          />
        </button>

        {/* Counter + zoom affordance in one quiet corner chip */}
        {showMainImage && (
          <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2">
            <span className="bg-background/85 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-medium tabular-nums text-muted-foreground">
              {safeIndex + 1}/{images.length}
            </span>
            <span className="hidden sm:flex bg-background/85 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground items-center gap-1.5">
              <ZoomIn className="size-3.5" aria-hidden="true" />
              {t("clickToZoom")}
            </span>
          </div>
        )}
      </div>

      {/* Lightbox (lazy) */}
      {isZoomed && showMainImage && (
        <LazyMediaLightbox
          images={images}
          activeIndex={safeIndex}
          productName={productName}
          onClose={() => setIsZoomed(false)}
          onNavigate={selectImage}
        />
      )}
    </div>
  );
}

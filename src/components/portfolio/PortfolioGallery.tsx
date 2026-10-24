"use client";

import type { Media } from "@spree/sdk";
import { ZoomIn } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

const LazyMediaLightbox = dynamic(
  () =>
    import("@/components/products/MediaLightbox").then((mod) => ({
      default: mod.MediaLightbox,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[100] bg-black/90" aria-hidden="true" />
    ),
  },
);

interface PortfolioGalleryProps {
  images: Media[];
  title: string;
}

export function PortfolioGallery({ images, title }: PortfolioGalleryProps) {
  const t = useTranslations("products");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {images.map((image, index) => (
          <li key={image.id}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${title} ${index + 1}`}
              className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted"
            >
              <Image
                src={image.original_url ?? ""}
                alt={image.alt || `${title} ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
              />
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/25 group-hover:opacity-100 group-focus-visible:bg-black/25 group-focus-visible:opacity-100"
              >
                <span className="rounded-md bg-background/85 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <ZoomIn className="mr-1 inline size-3.5" aria-hidden="true" />
                  {t("clickToZoom")}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {activeIndex !== null && (
        <LazyMediaLightbox
          images={images}
          activeIndex={activeIndex}
          productName={title}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </>
  );
}

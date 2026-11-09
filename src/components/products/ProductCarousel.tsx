"use client";

import type { Product } from "@spree/sdk";
import type { ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type Swiper from "swiper";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/products/ProductCard";

interface ProductCarouselProps {
  products: Product[];
  basePath: string;
  /** Optional currency used for analytics in each ProductCard. */
  currency?: string;
  /** Analytics list the cards belong to. */
  listId?: string;
  listName?: string;
  /**
   * Fetch the first card's image at high priority. Only the carousel nearest
   * the top of the page should, so several carousels don't compete.
   */
  prioritizeFirst?: boolean;
  /** Use compact title and price spacing while preserving the portrait image. */
  compactCards?: boolean;
}

const NAV_BUTTON_BASE =
  "absolute z-10 size-11 flex items-center justify-center cursor-pointer rounded-lg bg-card border border-border text-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors";
const NAV_BUTTON_CENTER = "top-1/2 -translate-y-1/2";

export function ProductCarousel({
  products,
  basePath,
  currency,
  listId = "featured-products",
  listName = "Featured Products",
  prioritizeFirst = true,
  compactCards = false,
}: ProductCarouselProps): ReactElement {
  const t = useTranslations("products");
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [isLocked, setIsLocked] = useState(products.length <= 1);
  const [swiper, setSwiper] = useState<Swiper | null>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const loop = products.length >= 8;
  const rewind = compactCards && !loop;
  const canWrap = loop || rewind;

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!swiper || swiper.destroyed) return;

    if (reducedMotion || isLocked || autoplayPaused) {
      if (swiper.autoplay.running) swiper.autoplay.stop();
    } else if (!swiper.autoplay.running) {
      swiper.autoplay.paused = false;
      swiper.autoplay.start();
    }
  }, [swiper, reducedMotion, isLocked, autoplayPaused]);

  const handleBeforeInit = useCallback((swiper: Swiper) => {
    if (typeof swiper.params.navigation === "object") {
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
    }
  }, []);

  const updateNavState = useCallback((swiper: Swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
    setIsLocked(swiper.isLocked);
  }, []);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("noProductsFound")}</p>
      </div>
    );
  }

  const hidePrev = isLocked || (!canWrap && isBeginning);
  const hideNext = isLocked || (!canWrap && isEnd);

  return (
    <div className="relative min-w-0">
      <button
        ref={prevRef}
        type="button"
        aria-label={t("carouselPrev")}
        disabled={hidePrev}
        className={`${NAV_BUTTON_BASE} ${NAV_BUTTON_CENTER} ${compactCards ? "left-2" : "-left-5"} ${hidePrev ? "invisible" : ""}`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        ref={nextRef}
        type="button"
        aria-label={t("carouselNext")}
        disabled={hideNext}
        className={`${NAV_BUTTON_BASE} ${NAV_BUTTON_CENTER} ${compactCards ? "right-2" : "-right-5"} ${hideNext ? "invisible" : ""}`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <SwiperComponent
        modules={[Autoplay, Navigation]}
        spaceBetween={compactCards ? 8 : 24}
        slidesPerView={compactCards ? 2 : 1}
        speed={reducedMotion ? 0 : 600}
        loop={loop}
        rewind={rewind}
        autoplay={{
          delay: 5000,
          pauseOnMouseEnter: true,
          disableOnInteraction: false,
        }}
        navigation={{
          addIcons: false,
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={handleBeforeInit}
        onSlideChange={updateNavState}
        onReachBeginning={updateNavState}
        onReachEnd={updateNavState}
        onAfterInit={updateNavState}
        onLock={updateNavState}
        onUnlock={updateNavState}
        onSwiper={setSwiper}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: compactCards ? 12 : 24 },
          768: { slidesPerView: 3, spaceBetween: compactCards ? 12 : 24 },
          1024: { slidesPerView: 4, spaceBetween: compactCards ? 16 : 24 },
        }}
        className={`product-carousel${compactCards ? " product-carousel-compact" : ""}`}
      >
        {products.map((product, index) => (
          <SwiperSlide key={product.id} className="p-1">
            <ProductCard
              product={product}
              basePath={basePath}
              index={index}
              listId={listId}
              listName={listName}
              currency={currency}
              compact={compactCards}
              fetchPriority={
                prioritizeFirst && index === 0 ? "high" : undefined
              }
            />
          </SwiperSlide>
        ))}
      </SwiperComponent>
      {compactCards && !isLocked && !reducedMotion && (
        <button
          type="button"
          aria-label={t(autoplayPaused ? "carouselPlay" : "carouselPause")}
          onClick={() => setAutoplayPaused((paused) => !paused)}
          className={`${NAV_BUTTON_BASE} top-2 right-2`}
        >
          {autoplayPaused ? (
            <Play aria-hidden size={16} />
          ) : (
            <Pause aria-hidden size={16} />
          )}
        </button>
      )}
    </div>
  );
}

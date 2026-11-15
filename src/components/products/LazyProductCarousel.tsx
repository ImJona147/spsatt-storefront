import dynamic from "next/dynamic";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import type { ProductCarouselProps } from "@/components/products/ProductCarousel";

export function ProductCarouselSkeleton({
  compactCards = false,
}: {
  compactCards?: boolean;
}): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={`grid grid-flow-col auto-cols-[100%] overflow-hidden sm:auto-cols-[calc((100%-24px)/2)] md:auto-cols-[calc((100%-48px)/3)] lg:auto-cols-[calc((100%-72px)/4)] gap-6 ${compactCards ? "carousel-skeleton-compact" : ""}`}
    >
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="p-1">
          <ProductCardSkeleton compact={compactCards} />
        </div>
      ))}
    </div>
  );
}

const StandardCarousel = dynamic(
  () =>
    import("@/components/products/ProductCarousel").then(
      (mod) => mod.ProductCarousel,
    ),
  {
    loading: () => <ProductCarouselSkeleton />,
  },
);
const CompactCarousel = dynamic(
  () =>
    import("@/components/products/ProductCarousel").then(
      (mod) => mod.ProductCarousel,
    ),
  {
    loading: () => <ProductCarouselSkeleton compactCards />,
  },
);

export function LazyProductCarousel(props: ProductCarouselProps) {
  const Carousel = props.compactCards ? CompactCarousel : StandardCarousel;
  return <Carousel {...props} />;
}

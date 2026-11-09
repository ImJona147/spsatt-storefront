import type * as React from "react";

/**
 * Skeleton placeholder for a single product card.
 * Matches the layout of `<ProductCard>` — no border, rounded image,
 * text placeholders below.
 */
export function ProductCardSkeleton(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse motion-reduce:animate-none"
    >
      <div className="aspect-[10/13] overflow-hidden rounded-md bg-muted/70" />
      <div className="p-4">
        <div className="mb-2 h-4 w-3/4 rounded-sm bg-muted" />
        <div className="h-5 w-1/4 rounded-sm bg-muted" />
      </div>
    </div>
  );
}

import type * as React from "react";

export function ProductCardSkeleton({
  compact = false,
}: {
  compact?: boolean;
}): React.JSX.Element {
  return (
    <div aria-hidden="true" className="loading-placeholder">
      <div className="aspect-[10/13] overflow-hidden rounded-md bg-muted/70" />
      <div className={compact ? "p-2" : "p-4"}>
        <div
          className={`${compact ? "h-8" : "h-10"} w-3/4 rounded-sm bg-muted`}
        />
        <div
          className={`${compact ? "mt-1 h-5" : "mt-2 h-7"} w-1/3 rounded-sm bg-muted`}
        />
      </div>
    </div>
  );
}

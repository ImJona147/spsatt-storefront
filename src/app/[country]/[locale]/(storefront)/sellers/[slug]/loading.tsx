import { ProductListingSkeleton } from "@/components/products/ProductListingSkeleton";

export default function SellerLoading(): React.JSX.Element {
  return (
    <div className="pb-8">
      <div
        aria-hidden="true"
        className="animate-pulse motion-reduce:animate-none"
      >
        <div className="h-48 bg-muted sm:h-64" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-4 h-4 w-32 rounded bg-muted" />
          <div className="mt-4 flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted sm:h-24 sm:w-24" />
            <div className="h-9 w-64 rounded bg-muted" />
          </div>
          <div className="mt-6 max-w-3xl space-y-3">
            <div className="h-4 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <ProductListingSkeleton />
      </div>
    </div>
  );
}

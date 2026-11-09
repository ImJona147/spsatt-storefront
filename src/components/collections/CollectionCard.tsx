import type { Collection } from "@spree/sdk";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";

interface CollectionCardProps {
  collection: Collection;
  basePath: string;
  productCountLabel: string;
  viewLabel: string;
  displayName?: string;
  displayDescription?: string | null;
}

export function CollectionCard({
  collection,
  basePath,
  productCountLabel,
  viewLabel,
  displayName,
  displayDescription,
}: CollectionCardProps): React.JSX.Element {
  const image = collection.image_url || collection.square_image_url;
  const name = displayName ?? collection.name;
  const description = displayDescription ?? collection.description;

  return (
    <Link
      href={`${basePath}/collections/${collection.permalink}`}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-200 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <ProductImage
          src={image}
          alt={name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-70 transition-opacity duration-200 group-hover:opacity-100"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-xl font-semibold text-foreground">
          {name}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {productCountLabel}
        </p>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-primary">
          {viewLabel}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </span>
      </div>
    </Link>
  );
}

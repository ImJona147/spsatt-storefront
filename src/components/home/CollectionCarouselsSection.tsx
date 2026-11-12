import type { Collection, Product } from "@spree/sdk";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { LazyProductCarousel } from "@/components/products/LazyProductCarousel";
import { Button } from "@/components/ui/button";
import { PRODUCT_CARD_FIELDS } from "@/lib/data/cached";
import {
  cachedListCollectionProducts,
  getCollections,
} from "@/lib/data/collections";
import { collectionName } from "@/lib/i18n/collection-labels";
import { getAccessToken } from "@/lib/spree";

/** Collections promoted on the home page, in the merchant's order. */
const HOME_COLLECTION_LIMIT = 3;
/** Collections looked at to fill the shelves; leading ones may be empty. */
const HOME_COLLECTION_CANDIDATES = 12;
/** Spare shelves loaded in case a collection has nothing sold in this market. */
const HOME_COLLECTION_SPARES = 2;
const PRODUCTS_PER_SHELF = 8;

interface CollectionCarouselsSectionProps {
  basePath: string;
  locale: string;
  country: string;
  currency?: string;
}

interface CollectionShelf {
  collection: Collection;
  products: Product[];
}

/**
 * The home page's product shelves: one carousel per collection. Renders
 * nothing when the store has no collection with products, or when
 * collections fail to load.
 */
export async function CollectionCarouselsSection({
  basePath,
  locale,
  country,
  currency,
}: CollectionCarouselsSectionProps): Promise<React.JSX.Element | null> {
  // The shelves read the session token to price B2B catalogs, so this boundary
  // is dynamic: without this, prerendering calls cookies() after the static
  // shell is done and the section renders nothing for no reason.
  await connection();
  const shelves = await loadShelves(locale, country);

  if (shelves.length === 0) {
    return null;
  }

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const tc = await getTranslations({
    locale: locale as Locale,
    namespace: "collections",
  });

  return (
    <div className="mx-auto w-full max-w-none space-y-6 px-2 pt-10 pb-6 sm:px-3 sm:pt-12 md:space-y-8 lg:px-4">
      {shelves.map(({ collection, products }, index) => {
        const headingId = `home-collection-${collection.id}`;
        const name = collectionName(tc, collection);
        return (
          <section
            key={collection.id}
            aria-labelledby={headingId}
            className="featured-products grid items-stretch gap-2 rounded-xl border border-border bg-card p-2 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3 sm:p-3 lg:grid-cols-[9rem_minmax(0,1fr)]"
          >
            <div className="flex flex-col items-center justify-center border-b border-border px-2 pb-2 text-center sm:min-h-full sm:border-r sm:border-b-0 sm:pb-0 sm:pr-3">
              <h2
                id={headingId}
                className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
              >
                {name}
              </h2>
              <span className="mt-2 text-sm font-medium text-muted-foreground">
                {t("collectionProductsCount", {
                  count: collection.products_count,
                })}
              </span>
              <Button
                variant="link"
                size="sm"
                className="mt-1 h-8 px-0 text-xs"
                asChild
              >
                <Link
                  href={`${basePath}/collections/${collection.permalink}`}
                  className="group"
                >
                  {t("viewAll")}
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </Button>
            </div>
            <LazyProductCarousel
              products={products}
              basePath={basePath}
              currency={currency}
              listId={`collection-${collection.id}`}
              listName={`Collection: ${name}`}
              prioritizeFirst={index === 0}
              compactCards
            />
          </section>
        );
      })}
    </div>
  );
}

/** Promoted collections with their first products; empty ones are skipped. */
async function loadShelves(
  locale: string,
  country: string,
): Promise<CollectionShelf[]> {
  const options = { locale, country };
  try {
    const [{ data: collections }, userToken] = await Promise.all([
      getCollections(
        {
          limit: HOME_COLLECTION_CANDIDATES,
          sort: "position",
          fields: ["id", "name", "permalink", "products_count", "description"],
        },
        options,
      ),
      getAccessToken(),
    ]);
    const shelves = await Promise.all(
      collections
        .filter((collection) => collection.products_count > 0)
        .slice(0, HOME_COLLECTION_LIMIT + HOME_COLLECTION_SPARES)
        .map(async (collection) => {
          const { data: products } = await cachedListCollectionProducts(
            collection.id,
            { limit: PRODUCTS_PER_SHELF, fields: PRODUCT_CARD_FIELDS },
            options,
            userToken,
          );
          return { collection, products };
        }),
    );
    // A collection can count products that aren't sold in this market.
    return shelves
      .filter((shelf) => shelf.products.length > 0)
      .slice(0, HOME_COLLECTION_LIMIT);
  } catch (error) {
    console.error("Home: failed to load collection carousels", error);
    return [];
  }
}

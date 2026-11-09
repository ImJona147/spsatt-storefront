import type { Product } from "@spree/sdk";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LazyProductCarousel } from "@/components/products/LazyProductCarousel";
import { Button } from "@/components/ui/button";
import { PRODUCT_CARD_FIELDS } from "@/lib/data/cached";
import { getCategoryProducts } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";

interface RelatedProductsSectionProps {
  categoryId?: string;
  categoryPermalink?: string;
  categoryName?: string;
  basePath: string;
  locale: string;
  currentProductId: string;
  currency?: string;
}

export async function RelatedProductsSection({
  categoryId,
  categoryPermalink,
  categoryName,
  basePath,
  locale,
  currentProductId,
  currency,
}: RelatedProductsSectionProps) {
  let products: Product[];
  try {
    const params = { limit: 9, fields: PRODUCT_CARD_FIELDS };
    const result = categoryId
      ? await getCategoryProducts(categoryId, params)
      : await getProducts(params);
    products = result.data.filter((product) => product.id !== currentProductId);
  } catch (error) {
    console.error("Product page: failed to load related products", error);
    return null;
  }

  if (products.length === 0) return null;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "products",
  });
  const headingId = "related-products-heading";

  return (
    <section
      aria-labelledby={headingId}
      className="border-t border-border bg-muted/30 py-12 sm:py-16"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
          <div>
            <h2
              id={headingId}
              className="text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl"
            >
              {t("relatedProducts")}
            </h2>
            {categoryName && (
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {categoryName}
              </p>
            )}
          </div>
          <Button variant="link" asChild>
            <Link
              href={
                categoryPermalink
                  ? `${basePath}/c/${categoryPermalink}`
                  : `${basePath}/products`
              }
            >
              {categoryPermalink ? t("viewCategory") : t("allProducts")}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </Button>
        </div>
        <LazyProductCarousel
          products={products}
          basePath={basePath}
          currency={currency}
          listId={`related-${categoryId ?? "popular"}`}
          listName={`Related: ${categoryName ?? "popular products"}`}
        />
      </div>
    </section>
  );
}

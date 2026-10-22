import type { Category } from "@spree/sdk";
import { SpreeError } from "@spree/sdk";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { SignalNotFound } from "@/components/not-found/SignalNotFound";
import { ProductFetchError } from "@/components/products/ProductFetchError";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCachedProduct, PRODUCT_PAGE_EXPAND } from "@/lib/data/cached";
import { generateProductMetadata } from "@/lib/metadata/product";
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  buildProductJsonLd,
} from "@/lib/seo";
import { getStoreUrl } from "@/lib/store";
import { ProductDetails } from "./ProductDetails";

interface ProductPageProps {
  params: Promise<{
    country: string;
    locale: string;
    slug: string;
  }>;
  searchParams: Promise<{
    category_id?: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { country, locale, slug } = await params;
  return generateProductMetadata({ country, locale, slug });
}

function findBreadcrumbCategory(
  categories: Category[],
  categoryId?: string,
): Category | undefined {
  if (categories.length === 0) return undefined;
  if (categoryId) {
    const match = categories.find((c) => c.id === categoryId);
    if (match) return match;
  }
  return categories[0];
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { country, locale, slug } = await params;
  const { category_id } = await searchParams;
  const basePath = `/${country}/${locale}`;

  let product;
  try {
    product = await getCachedProduct(slug, PRODUCT_PAGE_EXPAND);
  } catch (error) {
    // A 404 that survives the transient-retry window is a real missing
    // product; anything else (5xx, network) gets a retryable error state
    // instead of lying to the visitor that the product does not exist.
    if (error instanceof SpreeError && error.status === 404) {
      return (
        <Suspense fallback={null}>
          <SignalNotFound />
        </Suspense>
      );
    }
    return <ProductFetchError />;
  }

  const storeUrl = getStoreUrl();
  const canonicalUrl = storeUrl
    ? buildCanonicalUrl(
        storeUrl,
        `/${country}/${locale}/products/${product.slug}`,
      )
    : undefined;

  const breadcrumbCategory = findBreadcrumbCategory(
    product.categories || [],
    category_id,
  );

  return (
    <>
      {canonicalUrl && (
        <JsonLd data={buildProductJsonLd(product, canonicalUrl)} />
      )}
      {breadcrumbCategory && storeUrl && (
        <JsonLd
          data={buildBreadcrumbJsonLd(breadcrumbCategory, basePath, storeUrl, {
            name: product.name,
            slug: product.slug,
          })}
        />
      )}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {breadcrumbCategory && (
          <Breadcrumbs
            category={breadcrumbCategory}
            basePath={basePath}
            productName={product.name}
            locale={locale}
          />
        )}
      </div>
      <ProductDetails product={product} basePath={basePath} />
    </>
  );
}

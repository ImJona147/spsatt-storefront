import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { FeaturedProducts } from "@/components/products/FeaturedProducts";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { resolveCurrency } from "@/lib/data/markets";

function CarouselSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

interface FeaturedProductsSectionProps {
  basePath: string;
  locale: string;
  country: string;
}

async function FeaturedProductsWithCurrency({
  basePath,
  locale,
  country,
}: FeaturedProductsSectionProps) {
  // resolveCurrency reads cookies() via getLocaleOptions; render only inside
  // the Suspense boundary below or the route blocks on navigation.
  const currency = await resolveCurrency(country);
  return (
    <FeaturedProducts
      basePath={basePath}
      locale={locale}
      country={country}
      currency={currency}
    />
  );
}

export async function FeaturedProductsSection({
  basePath,
  locale,
  country,
}: FeaturedProductsSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 featured-products">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl lg:text-4xl">
          {t("featuredProducts")}
        </h2>
        <Button variant="link" asChild>
          <Link href={`${basePath}/products`}>
            {t("viewAll")}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Button>
      </div>
      <Suspense fallback={<CarouselSkeleton />}>
        <FeaturedProductsWithCurrency
          basePath={basePath}
          locale={locale}
          country={country}
        />
      </Suspense>
    </section>
  );
}

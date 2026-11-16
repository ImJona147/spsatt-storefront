import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/home/SectionHeading";
import { getPortfolioCategories } from "@/lib/data/portfolio";
import { resolveIndexCategories } from "@/lib/portfolio";
import { buildCanonicalUrl } from "@/lib/seo";
import { getStoreUrl } from "@/lib/store";

interface PortfolioPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: PortfolioPageProps): Promise<Metadata> {
  const { country, locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const storeUrl = getStoreUrl();
  return {
    ...(storeUrl
      ? {
          alternates: {
            canonical: buildCanonicalUrl(
              storeUrl,
              `/${country}/${locale}/portafolio`,
            ),
          },
        }
      : {}),
    title: t("portfolioTitle"),
    description: t("portfolioLead"),
  };
}

const TILE_SIZES = "(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw";

export default async function PortfolioIndexPage({
  params,
}: PortfolioPageProps) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const apiCategories = await getPortfolioCategories();
  const categories = resolveIndexCategories(apiCategories);
  const firstImageIndex = categories.findIndex(
    (category) => category.photoUrls[0] ?? category.coverUrl,
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <SectionHeading
        as="h1"
        eyebrow={t("portfolioEyebrow")}
        title={t("portfolioTitle")}
        lead={t("portfolioLead")}
      />
      {categories.length === 0 ? (
        <p className="mt-10 rounded-xl border border-border bg-secondary p-6 text-center text-base text-muted-foreground">
          {t("portfolioEmpty")}
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const imageUrl = category.coverUrl;

            return (
              <li key={category.slug}>
                <Link
                  href={`${basePath}/portafolio/${category.slug}`}
                  className="group relative block aspect-video overflow-hidden rounded-xl border border-border bg-muted"
                >
                  {imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt=""
                        fill
                        sizes={TILE_SIZES}
                        loading={index === firstImageIndex ? "eager" : "lazy"}
                        fetchPriority={
                          index === firstImageIndex ? "high" : undefined
                        }
                        className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent"
                      />
                    </>
                  ) : (
                    <span aria-hidden className="absolute inset-0 bg-muted" />
                  )}
                  <span className="absolute inset-x-0 bottom-0 p-4">
                    <span
                      className={
                        imageUrl
                          ? "block text-lg font-semibold text-white"
                          : "block text-lg font-semibold text-foreground"
                      }
                    >
                      {category.name}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

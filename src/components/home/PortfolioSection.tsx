import { ZoomIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/home/SectionHeading";
import { getPortfolioCategories } from "@/lib/data/portfolio";
import { resolveIndexCategories } from "@/lib/portfolio";

const TILE_SIZES = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw";

interface PortfolioSectionProps {
  basePath: string;
  locale: string;
}

export async function PortfolioSection({
  basePath,
  locale,
}: PortfolioSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const apiCategories = await getPortfolioCategories();
  const categories = resolveIndexCategories(apiCategories);
  const firstImageIndex = categories.findIndex(
    (category) => category.photoUrls[0] ?? category.coverUrl,
  );

  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="portfolio-title" className="bg-background">
      <div className="container mx-auto px-4 py-10 sm:px-6 md:py-16 lg:px-8">
        <SectionHeading
          eyebrow={t("portfolioEyebrow")}
          title={t("portfolioTitle")}
          lead={t("portfolioLead")}
          id="portfolio-title"
        />
        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
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
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                  >
                    <span className="inline-flex max-w-[calc(100%-2rem)] flex-wrap items-center justify-center gap-2 rounded-md border border-border bg-background/90 px-2.5 py-1 text-center text-xs font-medium text-foreground shadow-sm sm:text-sm">
                      <ZoomIn aria-hidden className="size-4 shrink-0" />
                      {t("portfolioClickHint")}
                    </span>
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                    <span
                      className={`block text-base font-semibold md:text-lg ${
                        imageUrl ? "text-white" : "text-foreground"
                      }`}
                    >
                      {category.name}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

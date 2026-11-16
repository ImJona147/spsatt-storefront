import type { Category } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

interface CategoryBannerProps {
  category: Category;
  basePath: string;
  locale: string;
}

export async function CategoryBanner({
  category,
  basePath,
  locale,
}: CategoryBannerProps) {
  "use cache: remote";
  cacheLife("minutes");
  cacheTag("category-banner");

  return (
    <>
      {category.image_url && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={category.image_url}
            alt=""
            fill
            loading="eager"
            sizes="100vw"
            className="object-contain"
          />
        </div>
      )}

      <div className="bg-background">
        <div
          className={`container mx-auto px-4 sm:px-6 lg:px-8 ${
            category.image_url ? "py-4 md:py-5" : "pt-4"
          }`}
        >
          <Breadcrumbs
            category={category}
            basePath={basePath}
            locale={locale}
          />

          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            {category.name}
          </h1>

          {category.description && (
            <p className="mb-1 text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex flex-wrap gap-2 items-center border-b border-border pb-4">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`${basePath}/c/${child.permalink}`}
                className="px-1.5 py-1 hover:bg-muted/20 rounded-lg text-foreground transition-colors"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

import type { Collection } from "@spree/sdk";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  collectionName,
  translatedCollectionDescription,
} from "@/lib/i18n/collection-labels";

interface CollectionHeaderProps {
  collection: Collection;
  basePath: string;
  locale: Locale;
}

/** Banner image, breadcrumb, name and description of a collection page. */
export async function CollectionHeader({
  collection,
  basePath,
  locale,
}: CollectionHeaderProps): Promise<React.JSX.Element> {
  const t = await getTranslations({ locale, namespace: "collections" });
  const displayName = collectionName(t, collection);
  const translatedDescription = translatedCollectionDescription(t, collection);
  const hasImage = Boolean(collection.image_url);

  return (
    <div
      className="relative flex min-h-[22rem] flex-col justify-end overflow-hidden bg-muted bg-cover bg-center sm:min-h-[26rem]"
      style={
        hasImage
          ? { backgroundImage: `url(${collection.image_url})` }
          : undefined
      }
    >
      {hasImage && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/35 to-foreground/10"
        />
      )}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol
            className={`flex items-center gap-1 text-sm ${hasImage ? "text-background/80" : "text-muted-foreground"}`}
          >
            <li>
              <Link
                href={`${basePath}/collections`}
                className="hover:underline"
              >
                {t("allCollections")}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li
              aria-current="page"
              className={hasImage ? "text-background" : "text-foreground"}
            >
              {displayName}
            </li>
          </ol>
        </nav>

        <h1
          className={`font-display mb-4 text-4xl font-semibold tracking-tight sm:text-5xl ${hasImage ? "text-background" : "text-foreground"}`}
        >
          {displayName}
        </h1>

        {translatedDescription ? (
          <p
            className={`mb-4 max-w-3xl ${hasImage ? "text-background/90" : "text-muted-foreground"}`}
          >
            {translatedDescription}
          </p>
        ) : collection.description_html ? (
          <div
            className={`prose mb-4 max-w-3xl ${hasImage ? "prose-invert" : "dark:prose-invert"}`}
            // Rich text is sanitized by Spree when it is saved.
            dangerouslySetInnerHTML={{ __html: collection.description_html }}
          />
        ) : (
          collection.description && (
            <p
              className={`mb-4 max-w-3xl ${hasImage ? "text-background/90" : "text-muted-foreground"}`}
            >
              {collection.description}
            </p>
          )
        )}
      </div>
    </div>
  );
}

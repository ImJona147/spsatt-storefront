import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildHreflangLanguages } from "@/lib/metadata/alternates";
import { normalizeOpenGraphLocale } from "@/lib/metadata/store";
import { buildCanonicalUrl, SOCIAL_IMAGE } from "@/lib/seo";
import { getStoreName, getStoreUrl } from "@/lib/store";

interface ProductsMetadataParams {
  country: string;
  locale: string;
}

export async function generateProductsMetadata({
  country,
  locale,
}: ProductsMetadataParams): Promise<Metadata> {
  const storeUrl = getStoreUrl();
  const canonicalUrl = storeUrl
    ? buildCanonicalUrl(storeUrl, `/${country}/${locale}/products`)
    : undefined;
  const languages = storeUrl
    ? await buildHreflangLanguages({
        storeUrl,
        country,
        locale,
        path: "/products",
      })
    : undefined;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "products",
  });
  const title = t("allProducts");
  const description = t("metaDescription");

  return {
    title,
    description,
    ...(canonicalUrl
      ? {
          alternates: {
            canonical: canonicalUrl,
            ...(languages ? { languages } : {}),
          },
        }
      : {}),
    openGraph: {
      title,
      description,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      siteName: getStoreName(),
      locale: normalizeOpenGraphLocale(locale),
      type: "website",
      images: [SOCIAL_IMAGE],
    },
  };
}

import type { Metadata } from "next";
import { getStore, storeSeoTitle } from "@/lib/data/store";
import { buildHreflangLanguages } from "@/lib/metadata/alternates";
import {
  normalizeOpenGraphLocale,
  storeMetaDescription,
} from "@/lib/metadata/store";
import { buildCanonicalUrl, SOCIAL_IMAGE } from "@/lib/seo";
import { getStoreUrl } from "@/lib/store";

interface HomeMetadataParams {
  country: string;
  locale: string;
}

export async function generateHomeMetadata({
  country,
  locale,
}: HomeMetadataParams): Promise<Metadata> {
  const store = await getStore(locale);
  const seoTitle = storeSeoTitle(store);
  const description = await storeMetaDescription(store, locale);
  const storeUrl = getStoreUrl();
  const canonicalUrl = storeUrl
    ? buildCanonicalUrl(storeUrl, `/${country}/${locale}`)
    : undefined;
  const languages = storeUrl
    ? await buildHreflangLanguages({
        storeUrl,
        country,
        locale,
        path: "",
      })
    : undefined;

  return {
    title: { absolute: seoTitle },
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
      title: seoTitle,
      description,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      siteName: store.name,
      locale: normalizeOpenGraphLocale(locale),
      type: "website",
      images: [SOCIAL_IMAGE],
    },
  };
}

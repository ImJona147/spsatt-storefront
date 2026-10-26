import type { Metadata } from "next";
import { buildHreflangLanguages } from "@/lib/metadata/alternates";
import { normalizeOpenGraphLocale } from "@/lib/metadata/store";
import { buildCanonicalUrl } from "@/lib/seo";
import {
  getStoreMetaDescription,
  getStoreName,
  getStoreSeoTitle,
  getStoreUrl,
} from "@/lib/store";

interface HomeMetadataParams {
  country: string;
  locale: string;
}

export async function generateHomeMetadata({
  country,
  locale,
}: HomeMetadataParams): Promise<Metadata> {
  const storeName = getStoreSeoTitle();
  const description = getStoreMetaDescription();
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
    title: { absolute: storeName },
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
      title: storeName,
      description,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      siteName: getStoreName(),
      locale: normalizeOpenGraphLocale(locale),
      type: "website",
    },
  };
}

"use server";

import { getClient } from "@/lib/spree";
import type { Category, Collection, Media, Product, Seller } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";

interface LocaleOptions {
  locale: string;
  country: string;
}

export type SitemapProduct = Product & {
  media?: Media[];
  updated_at?: string;
};

export type SitemapCategory = Category & {
  updated_at?: string;
};

export type SitemapCollection = Pick<Collection, "id" | "permalink">;

export type SitemapSeller = Pick<Seller, "id" | "slug">;

export type SitemapResource =
  | "products"
  | "categories"
  | "collections"
  | "sellers";

export async function getSitemapMarkets(options: LocaleOptions) {
  "use cache: remote";
  cacheLife("hours");
  cacheTag("markets", "sitemap");
  try {
    return (await getClient().markets.list(options)).data;
  } catch (error) {
    console.warn("Sitemap: Error al obtener mercados:", error);
    return [];
  }
}

export async function getSitemapResourceCount(
  resource: SitemapResource,
  marketId: string,
  options: LocaleOptions,
): Promise<number> {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("sitemap", resource, `sitemap-market:${marketId}`);

  try {
    const client = getClient();
    const query = { page: 1, limit: 1 };
    let count = 0;

    switch (resource) {
      case "products":
        count = (await client.products.list(query, options)).meta.count;
        break;
      case "categories":
        count = (
          await client.categories.list(
            { ...query, parent_id_not_null: true },
            options,
          )
        ).meta.count;
        break;
      case "collections":
        count = (
          await client.collections.list(
            { ...query, fields: ["permalink"] },
            options,
          )
        ).meta.count;
        break;
      case "sellers":
        count = (
          await client.sellers.list({ ...query, fields: ["slug"] }, options)
        ).meta.count;
        break;
    }
    return Math.max(0, count);
  } catch (error) {
    console.warn(
      `Sitemap: omitiendo conteo para '${resource}' por fallo de red:`,
      error,
    );
    return 0;
  }
}

export async function getSitemapProductPage(
  marketId: string,
  page: number,
  limit: number,
  options: LocaleOptions,
): Promise<SitemapProduct[]> {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("sitemap", "products", `sitemap-market:${marketId}`);
  try {
    const response = await getClient().products.list(
      { page, limit, expand: ["media"] },
      options,
    );
    return (response.data || []) as SitemapProduct[];
  } catch (error) {
    console.warn("Sitemap: Error al consultar páginas de productos:", error);
    return [];
  }
}

export async function getSitemapCategoryPage(
  marketId: string,
  page: number,
  limit: number,
  options: LocaleOptions,
): Promise<SitemapCategory[]> {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("sitemap", "categories", `sitemap-market:${marketId}`);
  try {
    const response = await getClient().categories.list(
      { page, limit, parent_id_not_null: true },
      options,
    );
    return response.data || [];
  } catch (error) {
    console.warn("Sitemap: Error al consultar páginas de categorías:", error);
    return [];
  }
}

export async function getSitemapSellerPage(
  marketId: string,
  page: number,
  limit: number,
  options: LocaleOptions,
): Promise<SitemapSeller[]> {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("sitemap", "sellers", `sitemap-market:${marketId}`);
  try {
    const response = await getClient().sellers.list(
      { page, limit, sort: "id", fields: ["slug"] },
      options,
    );
    return response.data || [];
  } catch (error) {
    console.warn("Sitemap: Error al consultar vendedores:", error);
    return [];
  }
}

export async function getSitemapCollectionPage(
  marketId: string,
  page: number,
  limit: number,
  options: LocaleOptions,
): Promise<SitemapCollection[]> {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag("sitemap", "collections", `sitemap-market:${marketId}`);
  try {
    const response = await getClient().collections.list(
      { page, limit, sort: "id", fields: ["permalink"] },
      options,
    );
    return response.data || [];
  } catch (error) {
    console.warn("Sitemap: Error al consultar colecciones:", error);
    return [];
  }
}

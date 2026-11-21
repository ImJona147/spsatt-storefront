"use server";

import type { ProductListParams } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { cache } from "react";
import { getCurrentBanners } from "@/lib/data/storefront-banners";
import { withTransient404Retry } from "@/lib/data/transient-404";
import {
  cacheTagSuffix,
  DEFAULT_SURFACE,
  getAccessToken,
  getClientForSurface,
  getLocaleOptions,
  type Surface,
} from "@/lib/spree";
import { withCampaignPrice } from "@/lib/utils/campaign-price";

/**
 * Cached product list fetch. Cache key is derived from all function
 * arguments by Next.js "use cache":
 *
 * - locale/country: determines language and market-specific pricing
 * - surface: DTC vs wholesale — different catalog + channel pricing. Baked
 *   into both the cache tag and the arguments so the two never share entries.
 * - userToken: per-user cache segmentation (separate arg, NOT passed to
 *   SDK). Authenticated users may see different prices (B2B, loyalty).
 *   Each user's JWT is unique so the cache is segmented per user.
 *   Guest users pass undefined. On the wholesale surface the token is
 *   always present — the channel 401s guests.
 */
async function cachedCatalogListProducts(
  params: ProductListParams | undefined,
  options: { locale?: string; country?: string },
  surface: Surface,
  userToken?: string,
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag(`products${cacheTagSuffix(surface)}`);
  return getClientForSurface(surface).products.list(params, {
    ...options,
    // Wholesale catalog requires the customer JWT — the channel is gated.
    ...(surface === "wholesale" && userToken
      ? { token: userToken }
      : undefined),
  });
}

export async function getProducts(
  params?: ProductListParams,
  surface: Surface = DEFAULT_SURFACE,
) {
  const options = await getLocaleOptions();
  const userToken = await getAccessToken();
  return cachedListProducts(params, options, surface, userToken);
}

/**
 * Persistent cached product detail fetch. Cache key is derived from:
 *
 * - slugOrId, expand: identify the product and response shape
 * - locale/country: determines language and market-specific pricing
 * - surface: DTC vs wholesale — see cachedListProducts
 * - userToken: per-user cache segmentation (separate arg, NOT passed to
 *   SDK). Authenticated users may see different prices (B2B, loyalty).
 *   Guest users pass undefined, so all guests share one entry.
 */
async function cachedCatalogGetProduct(
  slugOrId: string,
  expand: string[],
  options: { locale?: string; country?: string },
  surface: Surface,
  userToken?: string,
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag(
    `products${cacheTagSuffix(surface)}`,
    `product:${slugOrId}${cacheTagSuffix(surface)}`,
  );
  return withTransient404Retry(() =>
    getClientForSurface(surface).products.get(
      slugOrId,
      { expand },
      {
        ...options,
        ...(surface === "wholesale" && userToken
          ? { token: userToken }
          : undefined),
      },
    ),
  );
}

export async function getProduct(
  slugOrId: string,
  params?: { expand?: string[] },
  surface: Surface = DEFAULT_SURFACE,
) {
  const options = await getLocaleOptions();
  const userToken = await getAccessToken();
  return cachedGetProduct(
    slugOrId,
    params?.expand ?? [],
    options,
    surface,
    userToken,
  );
}

async function cachedGetProductFilters(
  params: Record<string, unknown> | undefined,
  options: { locale?: string; country?: string },
  surface: Surface,
  userToken?: string,
) {
  "use cache: remote";
  cacheLife("tenMinutes");
  cacheTag(`product-filters${cacheTagSuffix(surface)}`);
  return getClientForSurface(surface).products.filters(params, {
    ...options,
    ...(surface === "wholesale" && userToken
      ? { token: userToken }
      : undefined),
  });
}

export async function getProductFilters(
  params?: Record<string, unknown>,
  surface: Surface = DEFAULT_SURFACE,
) {
  const options = await getLocaleOptions();
  const userToken = await getAccessToken();
  return cachedGetProductFilters(params, options, surface, userToken);
}

const currentCampaignPercent = cache(async () => {
  await connection();
  const banners = await getCurrentBanners();
  return Math.max(0, ...banners.map((banner) => banner.discount_percent ?? 0));
});

export async function cachedListProducts(
  ...args: Parameters<typeof cachedCatalogListProducts>
) {
  const [response, percent] = await Promise.all([
    cachedCatalogListProducts(...args),
    args[2] === "dtc" ? currentCampaignPercent() : Promise.resolve(0),
  ]);
  return percent
    ? {
        ...response,
        data: response.data.map((product) =>
          withCampaignPrice(product, percent),
        ),
      }
    : response;
}

export async function cachedGetProduct(
  ...args: Parameters<typeof cachedCatalogGetProduct>
) {
  const [product, percent] = await Promise.all([
    cachedCatalogGetProduct(...args),
    args[3] === "dtc" ? currentCampaignPercent() : Promise.resolve(0),
  ]);
  return withCampaignPrice(product, percent);
}

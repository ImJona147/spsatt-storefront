"use server";

import { type ProductListParams, SpreeError } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import {
  cacheTagSuffix,
  DEFAULT_SURFACE,
  getAccessToken,
  getClientForSurface,
  getLocaleOptions,
  type Surface,
} from "@/lib/spree";

const PRODUCT_404_RETRY_DELAYS_MS = [250, 500];

const sleep = (ms: number) =>
  new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, ms));

/**
 * The Spree Store API intermittently answers 404 on product lookups that do
 * exist (observed on both slug and id lookups in production logs). A real
 * miss is rare enough that two short retries are cheap; a transient miss
 * otherwise surfaces to the visitor as "product not found". Runs inside the
 * "use cache: remote" function so a recovered success is cached normally and
 * a final failure is never cached.
 */
async function getWithTransient404Retry(
  surface: Surface,
  slugOrId: string,
  expand: string[],
  options: { locale?: string; country?: string; token?: string },
) {
  const client = getClientForSurface(surface);
  let lastError: unknown;
  for (
    let attempt = 0;
    attempt <= PRODUCT_404_RETRY_DELAYS_MS.length;
    attempt++
  ) {
    try {
      return await client.products.get(slugOrId, { expand }, options);
    } catch (error) {
      const isTransient404 =
        error instanceof SpreeError && error.status === 404;
      if (!isTransient404 || attempt === PRODUCT_404_RETRY_DELAYS_MS.length) {
        throw error;
      }
      lastError = error;
      await sleep(PRODUCT_404_RETRY_DELAYS_MS[attempt] ?? 0);
    }
  }
  throw lastError;
}

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
export async function cachedListProducts(
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
export async function cachedGetProduct(
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
  return getWithTransient404Retry(surface, slugOrId, expand, {
    ...options,
    ...(surface === "wholesale" && userToken
      ? { token: userToken }
      : undefined),
  });
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

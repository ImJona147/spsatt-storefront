"use server";

import type { Market } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import { getClient } from "@/lib/spree";
import { getDefaultCountry, getDefaultLocale } from "@/lib/store";

/**
 * Options that don't read request cookies: market list/resolve only need a
 * valid Store API context, and the env defaults are always valid. Reading
 * cookies() here would flag every route as blocking runtime data under
 * Cache Components (instant navigations).
 */
function defaultOptions(country?: string): {
  locale: string;
  country: string;
} {
  return {
    locale: getDefaultLocale(),
    country: (country ?? getDefaultCountry()).toLowerCase(),
  };
}

async function cachedListMarkets(options: {
  locale?: string;
  country?: string;
}) {
  "use cache: remote";
  cacheLife("hours");
  cacheTag("markets");
  return getClient().markets.list(options);
}

async function cachedResolveMarket(
  country: string,
  options: { locale?: string; country?: string },
) {
  "use cache: remote";
  cacheLife("hours");
  cacheTag("resolved-market");
  return getClient().markets.resolve(country, options);
}

async function cachedListMarketCountries(
  marketId: string,
  options: { locale?: string; country?: string },
) {
  "use cache: remote";
  cacheLife("hours");
  cacheTag("market-countries");
  return getClient().markets.countries.list(marketId, options);
}

export async function getMarkets(options?: {
  locale?: string;
  country?: string;
}): Promise<{ data: Market[] }> {
  const resolvedOptions = options ?? defaultOptions();
  return cachedListMarkets(resolvedOptions);
}

export async function resolveMarket(country: string) {
  return cachedResolveMarket(country, defaultOptions(country));
}

export async function getMarketCountries(marketId: string) {
  return cachedListMarketCountries(marketId, defaultOptions());
}

/**
 * Resolve the currency for a given country on the server side, using the
 * cached markets list. Returns undefined if the country is not served by
 * any market.
 */
export async function resolveCurrency(
  country: string,
): Promise<string | undefined> {
  const { data: markets } = await getMarkets(defaultOptions(country));
  const iso = country.toLowerCase();
  for (const market of markets) {
    const match = market.countries?.some((c) => c.iso.toLowerCase() === iso);
    if (match) return market.currency;
  }
  return undefined;
}

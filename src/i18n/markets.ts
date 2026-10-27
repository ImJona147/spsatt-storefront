import type { Market } from "@spree/sdk";
import {
  DEFAULT_LOCALE,
  resolveSupportedLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/i18n/locales";
import { negotiateLocale } from "@/i18n/normalize";

export interface MarketLocaleTarget {
  marketId: string;
  country: string;
  locale: SupportedLocale;
}

/** Resolve a Market locale tag to a locale this storefront can render. */
function renderableLocale(
  candidate: string | undefined,
): SupportedLocale | undefined {
  return negotiateLocale(candidate, SUPPORTED_LOCALES) as
    | SupportedLocale
    | undefined;
}

export function findMarketForCountry(
  markets: Market[],
  country: string,
): Market | undefined {
  const normalizedCountry = country.toLowerCase();
  return markets.find((market) =>
    market.countries?.some(
      (candidate) => candidate.iso.toLowerCase() === normalizedCountry,
    ),
  );
}

/** Return only locales that both the Market and this storefront can render. */
export function getMarketLocales(market: Market): SupportedLocale[] {
  const locales: SupportedLocale[] = [];

  for (const candidate of [
    market.default_locale,
    ...(market.supported_locales ?? []),
  ]) {
    // Market settings store regional tags (es-MX, es-419, en-US); the
    // storefront renders base locales only, so fall back to the base language
    // instead of dropping the locale and emptying the Market's routes.
    const locale = renderableLocale(candidate);
    if (locale && !locales.includes(locale)) locales.push(locale);
  }

  return locales;
}

export function isLocaleEnabledForMarket(
  market: Market,
  locale: string,
): boolean {
  const supportedLocale = resolveSupportedLocale(locale);
  return supportedLocale
    ? getMarketLocales(market).includes(supportedLocale)
    : false;
}

/** Resolve the Market's default locale only when the storefront can render it. */
export function getMarketDefaultLocale(
  market: Market,
): SupportedLocale | undefined {
  const locales = getMarketLocales(market);
  return renderableLocale(market.default_locale) ?? locales[0];
}

/** Build every valid country/locale route exposed by the configured Markets. */
export function getMarketLocaleTargets(
  markets: Market[],
): MarketLocaleTarget[] {
  const targets: MarketLocaleTarget[] = [];
  const seen = new Set<string>();

  for (const market of markets) {
    const locales = getMarketLocales(market);
    for (const country of market.countries ?? []) {
      const countryIso = country.iso.toLowerCase();
      for (const locale of locales) {
        const key = `${countryIso}/${locale.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        targets.push({ marketId: market.id, country: countryIso, locale });
      }
    }
  }

  return targets;
}

/** Resolve the configured default storefront route. */
export function getDefaultMarketLocaleTarget(
  markets: Market[],
): MarketLocaleTarget | undefined {
  const defaultMarket = markets.find((market) => market.default) ?? markets[0];
  const country = defaultMarket?.countries?.[0]?.iso.toLowerCase();
  if (!defaultMarket || !country) return undefined;

  const defaultLocale = getMarketDefaultLocale(defaultMarket) ?? DEFAULT_LOCALE;

  return { marketId: defaultMarket.id, country, locale: defaultLocale };
}

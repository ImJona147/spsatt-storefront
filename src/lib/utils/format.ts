export function formatDate(
  dateString: string | null,
  fallback = "-",
  locale = "en-US",
): string {
  if (!dateString) return fallback;
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(
  dateString: string | null,
  locale = "en-US",
): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * A payment or fulfillment status, translated under the "orders" namespace.
 * A status without a translation, such as one an extension adds, reads as
 * its own words ("in_production" → "in production").
 */
export function getStatusLabel(
  status: string | null,
  t: { (key: string): string; has(key: string): boolean },
): string {
  if (!status) return t("notAvailable");
  // Map API statuses like "partially_paid" to translation keys like "partiallyPaid"
  const key = status.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  return t.has(key) ? t(key) : status.replace(/_/g, " ");
}

// Orders saved before Spree 6.0 can carry the 5.6 values (balance_due,
// credit_owed, pending, void, ready, shipped) until they are next updated, so those are mapped too.
// Opacity tints keep badges legible on light and dark surfaces.
export function getPaymentStatusColor(status: string | null): string {
  switch (status) {
    case "paid":
      return "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400";
    case "none":
    case "authorized":
    case "partially_paid":
    case "overcharged":
    case "balance_due":
    case "credit_owed":
    case "pending":
      return "bg-amber-500/12 text-amber-700 dark:text-amber-400";
    case "partially_refunded":
    case "refunded":
      return "bg-sky-500/12 text-sky-700 dark:text-sky-400";
    case "voided":
    case "failed":
    case "void":
      return "bg-red-500/12 text-red-700 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function getFulfillmentStatusColor(status: string | null): string {
  switch (status) {
    case "fulfilled":
    case "delivered":
    case "shipped":
      return "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400";
    case "unfulfilled":
    case "backorder":
    case "pending":
    case "ready":
      return "bg-amber-500/12 text-amber-700 dark:text-amber-400";
    case "partial":
      return "bg-sky-500/12 text-sky-700 dark:text-sky-400";
    case "canceled":
      return "bg-red-500/12 text-red-700 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

const regionNames = new Map<string, Intl.DisplayNames | null>();

function regionNamesFor(locale: string): Intl.DisplayNames | null {
  if (!regionNames.has(locale)) {
    try {
      regionNames.set(
        locale,
        new Intl.DisplayNames([locale], { type: "region" }),
      );
    } catch {
      regionNames.set(locale, null);
    }
  }
  return regionNames.get(locale) ?? null;
}

/** A country's name in the reader's language, from its ISO 3166-1 code. */
export function countryName(iso: string, locale: string): string {
  return regionNamesFor(locale)?.of(iso) ?? iso;
}

/** Countries sorted by their name in the reader's language. */
export function sortByCountryName<T extends { iso: string }>(
  countries: T[],
  locale: string,
): T[] {
  const collator = new Intl.Collator(locale);
  return countries
    .map((country) => ({ country, name: countryName(country.iso, locale) }))
    .sort((a, b) => collator.compare(a.name, b.name))
    .map(({ country }) => country);
}

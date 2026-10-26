import type { Category, Media, Product } from "@spree/sdk";
import { ensureProtocol, getStoreName, getStoreUrl } from "@/lib/store";

/**
 * Alt text for the social sharing image (public/opengraph-image.png).
 */
export const SOCIAL_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "SPSATT – Artículos publicitarios en San Andrés Tuxtla: MDF, acrílico, neón, láser, impresión 3D y sublimación. Cotiza al 294 942 3064.",
} as const;

/**
 * Build a full canonical URL from a store URL and a relative path.
 */
export function buildCanonicalUrl(storeUrl: string, path: string): string {
  const base = ensureProtocol(storeUrl).replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Strip HTML tags from a string.
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Build JSON-LD Product schema.
 * https://schema.org/Product
 */
export function buildProductJsonLd(
  product: Product,
  canonicalUrl: string,
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: canonicalUrl,
  };

  if (product.description) {
    schema.description = stripHtml(product.description);
  }

  if (product.default_variant?.sku) {
    schema.sku = product.default_variant.sku;
  }

  const imageUrls = (product.media || [])
    .map((img: Media) => img.original_url || img.large_url)
    .filter(Boolean);
  // Fall back to thumbnail_url if no media from expand
  if (imageUrls.length === 0 && product.thumbnail_url) {
    imageUrls.push(product.thumbnail_url);
  }
  if (imageUrls.length > 0) {
    schema.image = imageUrls;
  }

  if (product.price?.amount && product.price?.currency) {
    schema.offers = {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: product.price.currency,
      price: product.price.amount,
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    };
  }

  return schema;
}

/**
 * Build JSON-LD BreadcrumbList schema from a category with ancestors.
 * https://schema.org/BreadcrumbList
 */
export function buildBreadcrumbJsonLd(
  category: Category,
  basePath: string,
  storeUrl: string,
  product?: { name: string; slug: string },
): Record<string, unknown> {
  const items: Array<{ name: string; url: string }> = [
    { name: "Home", url: buildCanonicalUrl(storeUrl, basePath) },
  ];

  if (category.ancestors) {
    for (const ancestor of category.ancestors) {
      if (!ancestor.is_root) {
        items.push({
          name: ancestor.name,
          url: buildCanonicalUrl(
            storeUrl,
            `${basePath}/c/${ancestor.permalink}`,
          ),
        });
      }
    }
  }

  items.push({
    name: category.name,
    url: buildCanonicalUrl(storeUrl, `${basePath}/c/${category.permalink}`),
  });

  if (product) {
    items.push({
      name: product.name,
      url: buildCanonicalUrl(storeUrl, `${basePath}/products/${product.slug}`),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Build JSON-LD LocalBusiness schema from environment variables and the
 * store's public address data.
 * https://schema.org/LocalBusiness
 */
export function buildOrganizationJsonLd(): Record<string, unknown> {
  const storeName = getStoreName();
  const storeUrl = getStoreUrl();
  const logoUrl = process.env.STORE_LOGO_URL;
  const facebook = process.env.STORE_FACEBOOK;
  const twitter = process.env.STORE_TWITTER;
  const instagram = process.env.STORE_INSTAGRAM;
  const supportEmail = process.env.STORE_SUPPORT_EMAIL;
  const description =
    process.env.STORE_META_DESCRIPTION ||
    "Artículos publicitarios al mayoreo: MDF, acrílico, neón, láser, impresión 3D y sublimación.";

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    ...(storeUrl ? { "@id": `${storeUrl}/#business` } : {}),
    name: storeName,
    description,
    slogan: "Donde las ideas se hacen realidad",
    ...(storeUrl ? { url: storeUrl } : {}),
    image: `${storeUrl ?? ""}/images/spsatt-og.png`,
    logo: logoUrl || `${storeUrl ?? ""}/icons/icon-512.png`,
    telephone: "+52 294 942 3064",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Independencia Ote. 246, Belen Grande",
      addressLocality: "San Andrés Tuxtla",
      addressRegion: "Veracruz",
      postalCode: "95700",
      addressCountry: "MX",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "14:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "16:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
  };

  const sameAs: string[] = [];
  if (facebook) sameAs.push(facebook);
  if (twitter) {
    sameAs.push(
      twitter.startsWith("http")
        ? twitter
        : `https://twitter.com/${twitter.replace("@", "")}`,
    );
  }
  if (instagram) {
    sameAs.push(
      instagram.startsWith("http")
        ? instagram
        : `https://instagram.com/${instagram.replace("@", "")}`,
    );
  }
  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  if (supportEmail) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      email: supportEmail,
      contactType: "customer service",
    };
  }

  return schema;
}

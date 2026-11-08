import type { Media, Price, Product, Variant } from "@spree/sdk";

export const GOOGLE_MERCHANT_COLUMNS = [
  "id",
  "title",
  "description",
  "availability",
  "availability_date",
  "expiration_date",
  "link",
  "mobile_link",
  "image_link",
  "price",
  "sale_price",
  "sale_price_effective_date",
  "identifier_exists",
  "gtin",
  "mpn",
  "brand",
  "product_highlight",
  "product_detail",
  "additional_image_link",
  "condition",
  "adult",
  "color",
  "size",
  "size_type",
  "size_system",
  "gender",
  "material",
  "pattern",
  "age_group",
  "multipack",
  "is_bundle",
  "unit_pricing_measure",
  "unit_pricing_base_measure",
  "energy_efficiency_class",
  "min_energy_efficiency_class",
  "max_energy_efficiency_class",
  "item_group_id",
  "video_link",
  "virtual_model_link",
  "cost_of_goods_sold",
] as const;

export type GoogleMerchantColumn = (typeof GOOGLE_MERCHANT_COLUMNS)[number];

export interface GoogleMerchantFeedOptions {
  storeUrl: string;
  country: string;
  locale: string;
  brand: string;
  assetBaseUrl?: string;
}

type FeedItem = {
  product: Product;
  variant: Variant | null;
  variants: Variant[];
};

const MAX_TITLE_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 200;
const MAX_ADDITIONAL_IMAGES = 10;

export function buildGoogleMerchantFeed(
  products: Product[],
  options: GoogleMerchantFeedOptions,
): string {
  const lines = [GOOGLE_MERCHANT_COLUMNS.join("\t")];
  const seenIds = new Set<string>();

  for (const product of products) {
    for (const item of feedItems(product)) {
      const row = buildRow(item, options, seenIds);
      if (!row) continue;
      lines.push(
        GOOGLE_MERCHANT_COLUMNS.map((column) => cleanField(row[column])).join(
          "\t",
        ),
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

function feedItems(product: Product): FeedItem[] {
  const variants = (product.variants ?? []).filter(
    (variant): variant is Variant => Boolean(variant),
  );

  if (variants.length > 0) {
    return variants.map((variant) => ({ product, variant, variants }));
  }

  if (product.default_variant) {
    return [
      {
        product,
        variant: product.default_variant,
        variants: [product.default_variant],
      },
    ];
  }

  return [{ product, variant: null, variants: [] }];
}

function buildRow(
  { product, variant, variants }: FeedItem,
  options: GoogleMerchantFeedOptions,
  seenIds: Set<string>,
): Record<GoogleMerchantColumn, string> | null {
  const price = formatPrice(variant?.price ?? product.price);
  const imageUrl = mainImageUrl(product, variant, options.assetBaseUrl);

  // A Merchant Center item without a price or image is rejected, so don't
  // send rows that can only fail validation.
  if (!price || !imageUrl) return null;

  const id = uniqueId(
    cleanField(
      variant?.sku || variant?.id || product.default_variant_id || product.id,
    ),
    variant?.id || product.id,
    seenIds,
  );
  const availability = availabilityFor(product, variant);
  const gtin = customFieldValue(product, [
    "gtin",
    "ean",
    "upc",
    "isbn",
    "barcode",
  ]);
  const mpn = customFieldValue(product, [
    "mpn",
    "manufacturer part",
    "numero de parte",
    "número de parte",
  ]);
  const brand =
    customFieldValue(product, ["brand", "marca"]) || cleanField(options.brand);
  const title = truncate(
    [product.name, variant?.options_text].filter(Boolean).join(" - "),
    MAX_TITLE_LENGTH,
  );
  const description = truncate(
    descriptionFor(product, brand),
    MAX_DESCRIPTION_LENGTH,
  );

  const row = emptyRow();
  row.id = id;
  row.title = title;
  row.description = description;
  row.availability = availability;
  if (availability === "preorder" || availability === "backorder") {
    row.availability_date = toGoogleDate(
      variant?.preorder_ships_at ?? product.preorder_ships_at,
    );
  }
  row.link = productLink(product, options);
  row.image_link = imageUrl;
  row.price = price;
  row.identifier_exists = gtin || mpn ? "yes" : "no";
  row.gtin = gtin;
  row.mpn = mpn;
  row.brand = brand;
  row.additional_image_link = additionalImageUrls(
    product,
    variant,
    imageUrl,
    options.assetBaseUrl,
  ).join(",");
  row.condition = "new";
  row.adult = "no";
  row.color = optionValue(product, variant, [
    "color",
    "colour",
    "color_swatch",
  ]);
  row.size = optionValue(product, variant, ["size", "talla"]);
  row.item_group_id =
    variants.length > 1
      ? cleanField(product.default_variant?.sku || product.id)
      : "";
  row.video_link = videoUrl(product, options.assetBaseUrl);

  return row;
}

function emptyRow(): Record<GoogleMerchantColumn, string> {
  return Object.fromEntries(
    GOOGLE_MERCHANT_COLUMNS.map((column) => [column, ""]),
  ) as Record<GoogleMerchantColumn, string>;
}

function descriptionFor(product: Product, brand: string): string {
  const source =
    product.description ||
    product.description_html ||
    product.meta_description ||
    "";
  const description = stripHtml(source);
  return description || `${product.name} de ${brand}.`;
}

function availabilityFor(
  product: Product,
  variant: Variant | null,
): "in_stock" | "out_of_stock" | "preorder" | "backorder" {
  const preorder = variant?.preorder ?? product.preorder;
  const backorderable = variant?.backorderable ?? product.backorderable;
  const inStock = variant?.in_stock ?? product.in_stock;
  const purchasable = variant?.purchasable ?? product.purchasable;

  if (preorder) return "preorder";
  if (backorderable && !inStock) return "backorder";
  return purchasable && inStock ? "in_stock" : "out_of_stock";
}

function productLink(
  product: Product,
  options: GoogleMerchantFeedOptions,
): string {
  const base = options.storeUrl.replace(/\/$/, "");
  return `${base}/${options.country}/${options.locale}/products/${encodeURIComponent(product.slug)}`;
}

function mainImageUrl(
  product: Product,
  variant: Variant | null,
  assetBaseUrl?: string,
): string {
  const media = mainMedia(product, variant);
  const url =
    imageUrlFromMedia(media) || variant?.thumbnail_url || product.thumbnail_url;
  return absoluteUrl(url, assetBaseUrl);
}

function mainMedia(
  product: Product,
  variant: Variant | null,
): Media | undefined {
  if (variant?.primary_media) return variant.primary_media;
  if (product.primary_media) return product.primary_media;

  const images = productImages(product);
  if (variant) {
    const variantImage = images.find((media) =>
      media.variant_ids.includes(variant.id),
    );
    if (variantImage) return variantImage;
  }
  return images[0];
}

function additionalImageUrls(
  product: Product,
  variant: Variant | null,
  mainUrl: string,
  assetBaseUrl?: string,
): string[] {
  const urls = productImages(product)
    .filter(
      (media) =>
        !variant ||
        media.variant_ids.length === 0 ||
        media.variant_ids.includes(variant.id),
    )
    .map((media) => absoluteUrl(imageUrlFromMedia(media), assetBaseUrl))
    .filter((url): url is string => Boolean(url) && url !== mainUrl);

  return Array.from(new Set(urls)).slice(0, MAX_ADDITIONAL_IMAGES);
}

function productImages(product: Product): Media[] {
  return (product.media ?? []).filter(
    (media) =>
      media.media_type !== "video" && Boolean(imageUrlFromMedia(media)),
  );
}

function imageUrlFromMedia(media: Media | undefined): string {
  if (!media) return "";
  return (
    media.xlarge_url ||
    media.original_url ||
    media.large_url ||
    media.medium_url ||
    ""
  );
}

function videoUrl(product: Product, assetBaseUrl?: string): string {
  const media = (product.media ?? []).find(
    (candidate) => candidate.media_type === "video",
  );
  return absoluteUrl(
    media?.video_url || media?.external_video_url,
    assetBaseUrl,
  );
}

function optionValue(
  product: Product,
  variant: Variant | null,
  matchers: string[],
): string {
  const optionTypes = new Map(
    (product.option_types ?? []).map((optionType) => [
      optionType.id,
      optionType,
    ]),
  );
  const values = (variant?.option_values ?? []).flatMap((optionValue) => {
    const optionType = optionTypes.get(optionValue.option_type_id);
    const haystack = [
      optionValue.option_type_name,
      optionValue.option_type_label,
      optionType?.name,
      optionType?.label,
      optionType?.kind,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchers.some((matcher) => haystack.includes(matcher))
      ? [optionValue.label || optionValue.name]
      : [];
  });

  return values.join("/");
}

function customFieldValue(product: Product, keys: string[]): string {
  const fields = product.custom_fields ?? [];
  const field = fields.find((candidate) =>
    [candidate.key, candidate.label].some((name) =>
      keys.some((key) => matchesFieldName(name, key)),
    ),
  );
  return cleanField(field?.value);
}

function matchesFieldName(candidate: string, key: string): boolean {
  const name = normalizeFieldName(candidate);
  const normalizedKey = normalizeFieldName(key);
  if (!name || !normalizedKey) return false;
  return (
    name === normalizedKey ||
    name.startsWith(`${normalizedKey} `) ||
    name.endsWith(` ${normalizedKey}`) ||
    name.includes(` ${normalizedKey} `)
  );
}

function normalizeFieldName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function formatPrice(price: Price | null | undefined): string {
  const amount = price?.amount?.trim();
  const currency = price?.currency?.trim();
  if (!amount || !currency) return "";
  return `${amount} ${currency}`;
}

function uniqueId(base: string, fallback: string, seen: Set<string>): string {
  let id = base || fallback;
  if (seen.has(id)) id = `${id}-${fallback}`;
  let suffix = 2;
  while (seen.has(id)) {
    id = `${base || fallback}-${suffix}`;
    suffix += 1;
  }
  seen.add(id);
  return id;
}

function toGoogleDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function absoluteUrl(
  value: string | null | undefined,
  baseUrl?: string,
): string {
  const url = value?.trim();
  if (!url) return "";
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

function stripHtml(value: string): string {
  return cleanField(
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">"),
  );
}

function truncate(value: string, maxLength: number): string {
  const clean = cleanField(value);
  if (clean.length <= maxLength) return clean;

  const sliced = clean.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  return (
    lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace) : sliced
  ).trimEnd();
}

function cleanField(value: unknown): string {
  return String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

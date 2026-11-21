import type { Price, Product } from "@spree/sdk";
import { strikethroughAmount } from "@/lib/utils/price";

export function campaignPrice(
  price: Price | null | undefined,
  percent: number,
): Price | null | undefined {
  if (
    !price?.amount ||
    !price.currency ||
    !Number.isFinite(percent) ||
    percent <= 0 ||
    percent > 100
  )
    return price;
  const value = Number(price.amount);
  if (!Number.isFinite(value) || value < 0) return price;
  const digits =
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: price.currency,
    }).resolvedOptions().maximumFractionDigits ?? 2;
  const [whole, fraction = ""] = price.amount.split(".");
  const base = BigInt(`${whole}${fraction}`);
  const factor = BigInt(100_000_000) - BigInt(Math.round(percent * 1_000_000));
  const denominator =
    BigInt(10) ** BigInt(fraction.length) * BigInt(100_000_000);
  const numerator = base * factor * BigInt(10) ** BigInt(digits);
  const units = (numerator + denominator / BigInt(2)) / denominator;
  const raw = units.toString().padStart(digits + 1, "0");
  const amount = digits
    ? `${raw.slice(0, -digits)}.${raw.slice(-digits)}`
    : raw;
  return { ...price, amount };
}

export function hasCatalogSale(
  product: Pick<Product, "price" | "original_price">,
): boolean {
  const marked = product as Product & { catalog_sale?: boolean };
  if (marked.catalog_sale !== undefined) return marked.catalog_sale;
  return strikethroughAmount(product.price, product.original_price) !== null;
}

export function hasCampaignPromotion(
  product: Pick<Product, "price" | "original_price">,
): boolean {
  return (
    !!product.price?.amount &&
    (product as Product & { campaign_promotion?: boolean })
      .campaign_promotion === true
  );
}

export function withCampaignPrice(
  product: Product,
  percent: number,
): Product & { catalog_sale?: boolean; campaign_promotion?: boolean } {
  if (!percent || !product.price) return product;
  const excluded = hasCatalogSale(product);
  return {
    ...product,
    catalog_sale: excluded,
    campaign_promotion: !excluded,
    original_price: excluded
      ? product.original_price
      : (product.original_price ?? product.price),
    price: excluded
      ? product.price
      : (campaignPrice(product.price, percent) ?? product.price),
    default_variant: product.default_variant
      ? {
          ...product.default_variant,
          ...{
            catalog_sale: hasCatalogSale(product.default_variant),
            campaign_promotion: !hasCatalogSale(product.default_variant),
          },
          original_price:
            product.default_variant.original_price ??
            product.default_variant.price,
          price:
            (hasCatalogSale(product.default_variant)
              ? product.default_variant.price
              : campaignPrice(product.default_variant.price, percent)) ??
            product.default_variant.price,
        }
      : product.default_variant,
    variants: product.variants?.map((variant) => ({
      ...variant,
      ...{
        catalog_sale: hasCatalogSale(variant),
        campaign_promotion: !hasCatalogSale(variant),
      },
      original_price: variant.original_price ?? variant.price,
      price:
        (hasCatalogSale(variant)
          ? variant.price
          : campaignPrice(variant.price, percent)) ?? variant.price,
    })),
  };
}

import type { Price, Product } from "@spree/sdk";

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
  const denominator = BigInt(10) ** BigInt(fraction.length) * BigInt(100_000_000);
  const numerator = base * factor * BigInt(10) ** BigInt(digits);
  const units = (numerator + denominator / BigInt(2)) / denominator;
  const raw = units.toString().padStart(digits + 1, "0");
  const amount = digits
    ? `${raw.slice(0, -digits)}.${raw.slice(-digits)}`
    : raw;
  return { ...price, amount };
}

export function withCampaignPrice(product: Product, percent: number): Product {
  if (!percent || !product.price) return product;
  return {
    ...product,
    original_price: product.original_price ?? product.price,
    price: campaignPrice(product.price, percent) ?? product.price,
    default_variant: product.default_variant
      ? {
          ...product.default_variant,
          original_price:
            product.default_variant.original_price ??
            product.default_variant.price,
          price:
            campaignPrice(product.default_variant.price, percent) ??
            product.default_variant.price,
        }
      : product.default_variant,
    variants: product.variants?.map((variant) => ({
      ...variant,
      original_price: variant.original_price ?? variant.price,
      price: campaignPrice(variant.price, percent) ?? variant.price,
    })),
  };
}

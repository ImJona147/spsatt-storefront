"use client";

import type { Media, Product, Variant } from "@spree/sdk";
import { CircleCheckBig, CircleMinus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { QuantityPickerField } from "@/components/cart/QuantityPickerField";
import { HiddenPricePrompt } from "@/components/products/HiddenPricePrompt";
import { MediaGallery } from "@/components/products/MediaGallery";
import { ProductCustomFields } from "@/components/products/ProductCustomFields";
import { VariantPicker } from "@/components/products/VariantPicker";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useHiddenPricing } from "@/contexts/HiddenPricingContext";
import { useStore } from "@/contexts/StoreContext";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { trackAddToCart, trackViewItem } from "@/lib/analytics/gtm";
import { strikethroughAmount } from "@/lib/utils/price";

interface ProductDetailsProps {
  product: Product;
  basePath: string;
}

/** Section marker shared with the home eyebrow: short rule + uppercase label. */
function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-primary">
      <span aria-hidden className="h-px w-8 bg-primary" />
      {children}
    </h2>
  );
}

export function ProductDetails({ product, basePath }: ProductDetailsProps) {
  const { addItem } = useCart();
  const { currency } = useStore();
  const t = useTranslations("products");
  const tw = useTranslations("wholesale");
  const formatMoney = useFormatMoney();
  // Non-null inside a HiddenPricingProvider (wholesale `prices_hidden`, guest
  // view): prices are null on purpose, and ordering is gated behind sign-in.
  const hiddenPricing = useHiddenPricing();
  const pricesHidden = hiddenPricing !== null;

  // Filter variants list
  const variants = useMemo(() => {
    return (product.variants || []).filter(Boolean);
  }, [product.variants]);

  const hasVariants = variants.length > 0;
  const optionTypes = product.option_types || [];

  // Initialize with default variant or first available variant
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    if (product.default_variant) {
      return product.default_variant;
    }
    if (hasVariants) {
      return variants.find((v) => v.purchasable) || variants[0];
    }
    // For products without variants, use default variant
    return product.default_variant || null;
  });

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Track product view (analytics - client-only side effect)
  useEffect(() => {
    trackViewItem(product, currency);
  }, [product, currency]);

  const galleryImages = useMemo((): Media[] => {
    return product.media || [];
  }, [product.media]);

  const variantImageIndex = useMemo((): number | null => {
    if (!selectedVariant) return null;
    const index = galleryImages.findIndex((m) =>
      m.variant_ids.includes(selectedVariant.id),
    );
    return index >= 0 ? index : null;
  }, [selectedVariant, galleryImages]);

  const price = selectedVariant?.price ?? product.price;
  const originalPrice =
    selectedVariant?.original_price ?? product.original_price;
  const displayPrice = price
    ? formatMoney(price.amount, price.currency, { unitPrice: true })
    : null;
  const struckAmount = strikethroughAmount(price, originalPrice);
  const onSale = struckAmount !== null;
  const strikethroughPrice =
    price && struckAmount
      ? formatMoney(struckAmount, price.currency, { unitPrice: true })
      : null;
  // Real discount from the backend amounts; shown only when both are numeric.
  const discountPercent =
    onSale && price && struckAmount
      ? Math.round((1 - Number(price.amount) / Number(struckAmount)) * 100)
      : null;

  const sku = selectedVariant?.sku ?? product.default_variant?.sku;

  // Purchasability
  const isPurchasable = hasVariants
    ? (selectedVariant?.purchasable ?? false)
    : (product.purchasable ?? false);

  const inStock = hasVariants
    ? (selectedVariant?.in_stock ?? false)
    : (product.in_stock ?? false);

  const handleAddToCart = async () => {
    const variantId =
      selectedVariant?.id ||
      product.default_variant?.id ||
      product.default_variant_id;
    if (!variantId) {
      throw new Error("No variant selected");
    }

    setLoading(true);
    await addItem(variantId, quantity);
    setLoading(false);
    trackAddToCart(product, selectedVariant, quantity, currency);
  };

  const addToCartButton = (className?: string) => (
    <Button
      size="lg"
      className={className}
      onClick={handleAddToCart}
      disabled={loading || !isPurchasable}
    >
      {loading ? (
        <>
          <span
            className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          {t("adding")}
        </>
      ) : isPurchasable ? (
        <>
          <ShoppingBag className="size-5" aria-hidden="true" />
          {t("addToCart")}
        </>
      ) : (
        t("outOfStock")
      )}
    </Button>
  );

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-12">
        {/* Gallery leads (~55%); the info column is capped at 30rem so type
            and controls stay at a readable measure instead of stretching. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] gap-10 lg:gap-12 items-start">
          {/* Media Gallery */}
          <div className="lg:sticky lg:top-24">
            <MediaGallery
              images={galleryImages}
              productName={product.name}
              activeIndex={variantImageIndex}
            />
          </div>

          {/* Product Info */}
          <div>
            {/* The breadcrumb above already names the category; the title
                carries the page on its own. */}
            <h1 className="text-[1.875rem] leading-[1.12] font-bold tracking-tight text-balance text-foreground sm:text-4xl">
              {product.name}
            </h1>

            {/* Price + stock: one compact decision block */}
            <div className="mt-5 rounded-xl bg-secondary px-4 py-3.5">
              <div
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
                aria-live="polite"
              >
                {displayPrice ? (
                  <span className="text-3xl font-bold text-foreground tabular-nums">
                    {displayPrice}
                  </span>
                ) : (
                  <HiddenPricePrompt className="inline-flex items-center gap-1.5 text-base font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors" />
                )}
                {onSale && strikethroughPrice && (
                  <>
                    <span className="text-base text-muted-foreground line-through tabular-nums">
                      {strikethroughPrice}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                      {discountPercent !== null
                        ? `${t("sale")} ${discountPercent}%`
                        : t("sale")}
                    </span>
                  </>
                )}
              </div>

              {/* Stock status: color never carries the state alone */}
              <div className="mt-2.5">
                {inStock ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <CircleCheckBig className="size-4" aria-hidden="true" />
                    {t("inStock")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-sm font-medium text-muted-foreground">
                    <CircleMinus className="size-4" aria-hidden="true" />
                    {t("outOfStock")}
                  </span>
                )}
              </div>
            </div>

            {/* Variant Picker */}
            {hasVariants && optionTypes.length > 0 && (
              <div className="mt-6">
                <VariantPicker
                  variants={variants}
                  optionTypes={optionTypes}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />
              </div>
            )}

            {/* Buy box: quantity + CTA on a solid card surface */}
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              {pricesHidden ? (
                // Guest on a prices-hidden channel: no pricing, no ordering —
                // route them through the wholesale sign-in first.
                <Button asChild size="lg" className="w-full justify-center">
                  <Link href={hiddenPricing.signInHref}>
                    {tw("hiddenPrice.signInToOrder")}
                  </Link>
                </Button>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <QuantityPickerField
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    size="lg"
                  />
                  {/* Mobile's CTA lives in the fixed bottom bar; desktop
                      gets the full-width button inside the buy box. */}
                  <div className="hidden lg:block flex-1">
                    {addToCartButton("w-full justify-center")}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description_html && (
              <section className="mt-8 border-t border-border pt-6">
                <SectionLabel>{t("description")}</SectionLabel>
                {/* Description is admin-authored HTML from the Spree CMS backend (trusted source) */}
                <div
                  className="mt-4 text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: product.description_html,
                  }}
                />
              </section>
            )}

            {/* Custom Fields */}
            <ProductCustomFields customFields={product.custom_fields} />

            {/* Product Details */}
            <section className="mt-6 border-t border-border pt-6">
              <SectionLabel>{t("details")}</SectionLabel>
              <dl className="mt-4">
                {sku && (
                  <div className="flex gap-4 border-t border-border py-2.5 first:border-t-0 first:pt-0">
                    <dt className="w-28 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("sku")}
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {sku}
                    </dd>
                  </div>
                )}
                {selectedVariant?.options_text && (
                  <div className="flex gap-4 border-t border-border py-2.5">
                    <dt className="w-28 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("options")}
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {selectedVariant.options_text}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </div>
        </div>
      </div>

      {/* Fixed mobile buy bar: price + CTA, never covering the last content
          (the container above reserves pb-28 for it). */}
      {!pricesHidden && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="min-w-0">
              {displayPrice ? (
                <p className="text-base font-semibold text-foreground tabular-nums truncate">
                  {displayPrice}
                </p>
              ) : null}
              {onSale && strikethroughPrice ? (
                <p className="text-xs text-muted-foreground line-through tabular-nums">
                  {strikethroughPrice}
                </p>
              ) : null}
            </div>
            <div className="ml-auto shrink-0">
              {addToCartButton("w-[11rem] justify-center")}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

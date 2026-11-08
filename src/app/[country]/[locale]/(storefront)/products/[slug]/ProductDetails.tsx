"use client";

import type { Category, Media, Product, Seller, Variant } from "@spree/sdk";
import { CircleCheckBig, CircleMinus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { QuantityPickerField } from "@/components/cart/QuantityPickerField";
import { HiddenPricePrompt } from "@/components/products/HiddenPricePrompt";
import { MediaGallery } from "@/components/products/MediaGallery";
import { ProductCustomFields } from "@/components/products/ProductCustomFields";
import { SectionLabel } from "@/components/products/SectionLabel";
import { VariantPicker } from "@/components/products/VariantPicker";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useHiddenPricing } from "@/contexts/HiddenPricingContext";
import { useStore } from "@/contexts/StoreContext";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { trackAddToCart, trackViewItem } from "@/lib/analytics/gtm";
import { cn } from "@/lib/utils";
import { strikethroughAmount } from "@/lib/utils/price";

interface ProductDetailsProps {
  product: Product;
  basePath: string;
  category?: Category;
  /** Marketplace seller to credit under the title; omit to hide the line. */
  seller?: Pick<Seller, "name" | "slug"> | null;
}

export function ProductDetails({
  product,
  basePath,
  category,
  seller,
}: ProductDetailsProps) {
  const { addItem } = useCart();
  const { currency } = useStore();
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const ts = useTranslations("sellers");
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
      className={cn("gap-2.5 font-semibold", className)}
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
            {category && (
              <Link
                href={`${basePath}/c/${category.permalink}`}
                className="mb-3 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:text-primary/70 dark:text-[oklch(0.64_0.14_270)]"
              >
                <span aria-hidden className="h-px w-8 bg-primary" />
                {category.name}
              </Link>
            )}

            <h1 className="text-[1.875rem] leading-[1.12] font-bold tracking-tight text-balance text-foreground sm:text-4xl">
              {product.name}
            </h1>

            {seller && (
              <p className="mt-2 text-sm text-muted-foreground">
                {ts.rich("soldBy", {
                  name: seller.name,
                  link: (chunks) => (
                    <Link
                      href={`${basePath}/sellers/${seller.slug}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            )}

            {/* Price reads as the second line of the title, with availability
                beside it, not as a boxed panel competing with the buy box. */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
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

              {/* Text and icon carry the state, not color alone. Stock with no
                  price cannot be bought, so it reads as out of stock like the
                  button; a guest who must sign in for prices gets no button,
                  so stock alone decides. */}
              {inStock && (isPurchasable || pricesHidden) ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-success/12 px-2.5 py-1 text-[13px] font-semibold text-success">
                  <CircleCheckBig className="size-4" aria-hidden="true" />
                  {t("inStock")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-[13px] font-medium text-muted-foreground">
                  <CircleMinus className="size-4" aria-hidden="true" />
                  {t("outOfStock")}
                </span>
              )}
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

            {/* Buy box: the only card in the column, so the purchase controls
                read as one unit. The visible label lets the stepper stand on
                its own on mobile, where the CTA lives in the bottom bar. */}
            <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4 sm:p-5">
              {pricesHidden ? (
                // Guest on a prices-hidden channel: no pricing, no ordering —
                // route them through the wholesale sign-in first.
                <Button asChild size="lg" className="w-full justify-center">
                  <Link href={hiddenPricing.signInHref}>
                    {tw("hiddenPrice.signInToOrder")}
                  </Link>
                </Button>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex w-full flex-col gap-2 sm:w-auto">
                    <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
                      {tc("quantity")}
                    </span>
                    <QuantityPickerField
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      size="lg"
                      className="h-13 w-full sm:w-auto"
                    />
                  </div>
                  {/* Mobile's CTA lives in the fixed bottom bar; desktop
                      gets the full-width button inside the buy box. */}
                  <div className="hidden flex-1 lg:block">
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
                  className="mt-4 text-foreground prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: product.description_html,
                  }}
                />
              </section>
            )}

            {/* Custom Fields */}
            <ProductCustomFields customFields={product.custom_fields} />

            {/* Product Details: only when there is a row to show */}
            {(sku || selectedVariant?.options_text) && (
              <section className="mt-6 border-t border-border pt-6">
                <SectionLabel>{t("details")}</SectionLabel>
                <dl className="mt-4">
                  {sku && (
                    <div className="flex gap-4 border-t border-border py-2.5 first:border-t-0 first:pt-0">
                      <dt className="flex-0 shrink-0 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("sku")}
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {sku}
                      </dd>
                    </div>
                  )}
                  {selectedVariant?.options_text && (
                    <div className="flex gap-4 border-t border-border py-2.5">
                      <dt className="flex-0 shrink-0 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("options")}
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {selectedVariant.options_text}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Fixed mobile buy bar: price + CTA, never covering the last content
          (the container above reserves pb-28 for it). */}
      {!pricesHidden && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background lg:hidden">
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

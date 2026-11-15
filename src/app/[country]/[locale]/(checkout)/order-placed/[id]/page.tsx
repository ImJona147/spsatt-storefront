"use client";

import { CircleCheckBig, MessageCircle, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { AddressBlock } from "@/components/order/AddressBlock";
import { OrderTotals } from "@/components/order/OrderTotals";
import { PaymentInfo } from "@/components/order/PaymentInfo";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { trackPurchase } from "@/lib/analytics/gtm";
import { buildWhatsAppUrl } from "@/lib/constants/business";
import { getCompletedOrder } from "@/lib/data/checkout";
import { getCachedCompletedOrder } from "@/lib/utils/completed-order-cache";
import { extractBasePath } from "@/lib/utils/path";
import { lineItemAmount } from "@/lib/utils/price";
import { type CompletedPurchase, toPurchase } from "@/lib/utils/purchase";

interface OrderPlacedPageProps {
  params: Promise<{
    id: string;
    country: string;
    locale: string;
  }>;
}

export default function OrderPlacedPage({ params }: OrderPlacedPageProps) {
  const { id: cartId } = use(params);
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const { setSummaryContent } = useCheckout();
  const t = useTranslations("orderPlaced");
  const tc = useTranslations("common");
  const formatMoney = useFormatMoney();

  const [result, setResult] = useState<CompletedPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"orderNotFound" | "failedToLoad" | null>(
    null,
  );

  // Clear sidebar summary
  useEffect(() => {
    setSummaryContent(null);
  }, [setSummaryContent]);

  // Track whether we've already loaded the order to avoid re-fetching
  // after the cart token cookie is cleared by CartProvider
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    let cancelled = false;

    async function loadOrder() {
      try {
        // Try cached order first (from the completion response),
        // fall back to API for page refreshes.
        const cached = getCachedCompletedOrder(
          cartId,
        ) as CompletedPurchase | null;
        const orderData = cached ?? (await getCompletedOrder(cartId));
        if (cancelled) return;

        loadedRef.current = true;

        if (orderData) {
          setResult(orderData);
          try {
            trackPurchase(orderData);
          } catch {
            // Analytics failure must not break the order confirmation UX
          }
        } else {
          setError("orderNotFound");
        }
        setLoading(false);
      } catch {
        if (!cancelled) {
          loadedRef.current = true;
          setError("failedToLoad");
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [cartId]);

  // One checkout, whether it produced one order or one per seller.
  const purchase = useMemo(
    () => (result ? toPurchase(result) : null),
    [result],
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 py-12">
        <div className="h-12 w-12 bg-muted rounded-lg mx-auto" />
        <div className="h-8 bg-muted rounded w-1/2 mx-auto" />
        <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
        <div className="h-64 bg-muted rounded mt-8" />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          {t(error || "orderNotFound")}
        </h1>
        <Button asChild>
          <Link href={`${basePath}/`}>{tc("continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  const customerName =
    purchase.billing_address?.full_name ||
    purchase.shipping_address?.full_name ||
    "";
  const paymentStatusLabels = {
    none: t("paymentStatusNone"),
    authorized: t("paymentStatusAuthorized"),
    partially_paid: t("paymentStatusPartiallyPaid"),
    paid: t("paymentStatusPaid"),
    partially_refunded: t("paymentStatusPartiallyRefunded"),
    refunded: t("paymentStatusRefunded"),
    overcharged: t("paymentStatusOvercharged"),
    voided: t("paymentStatusVoided"),
  };
  const paymentStatusLabel = purchase.payment_status
    ? paymentStatusLabels[purchase.payment_status]
    : paymentStatusLabels.none;
  const whatsappItems = purchase.segments.flatMap((segment) => segment.items);
  const whatsappMessage = [
    t("whatsappMessageIntro"),
    t("whatsappMessageOrder", { number: purchase.number }),
    customerName ? t("whatsappMessageCustomer", { name: customerName }) : null,
    purchase.email
      ? t("whatsappMessageEmail", { email: purchase.email })
      : null,
    t("whatsappMessagePaymentStatus", { status: paymentStatusLabel }),
    t("whatsappMessageTotal", {
      total: formatMoney(purchase.totals.total, purchase.currency),
    }),
    t("whatsappMessageItems"),
    ...whatsappItems.slice(0, 10).map((item) =>
      t("whatsappMessageItem", {
        quantity: item.quantity,
        name: item.name,
        options: item.options_text ? ` (${item.options_text})` : "",
      }),
    ),
    whatsappItems.length > 10
      ? t("whatsappMessageMoreItems", { count: whatsappItems.length - 10 })
      : null,
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappUrl = buildWhatsAppUrl(whatsappMessage);

  return (
    <div className="py-8 max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-10">
        <CircleCheckBig className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {customerName
            ? t("thanksForOrder", { name: customerName.split(" ")[0] })
            : t("thanksForOrderAnonymous")}
        </h1>
        <p className="text-muted-foreground">
          {t("orderNumber", { number: purchase.number })}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {t("emailConfirmation")}
        </p>
        {purchase.split && (
          <p className="text-sm text-muted-foreground mt-2">
            {t("splitDeliveries", { count: purchase.segments.length })}
          </p>
        )}
      </div>

      <section
        aria-labelledby="payment-follow-up-title"
        className="mb-6 rounded-xl border border-primary/25 bg-primary/5 p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <CircleCheckBig
            aria-hidden
            className="mt-0.5 size-5 shrink-0 text-primary"
          />
          <div className="min-w-0 flex-1">
            <h2
              id="payment-follow-up-title"
              className="text-base font-semibold text-foreground"
            >
              {purchase.payment_status === "paid"
                ? t("paymentCompleted")
                : t("orderReceived")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("whatsappVerificationNote")}
            </p>
            <p className="mt-3 text-sm text-foreground">
              <span className="font-medium">{t("paymentStatusLabel")}:</span>{" "}
              {paymentStatusLabel}
            </p>
            <Button asChild className="mt-4 w-full sm:w-auto">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden className="size-4" />
                {t("whatsappButton")}
              </a>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("whatsappOpenNotice")}
            </p>
          </div>
        </div>
      </section>

      {/* Order Items */}
      <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">
            {t("orderItems")}
          </h2>
        </div>

        {/* One block per order the checkout produced — a single-seller checkout
            has exactly one, so it reads as a plain list. */}
        {purchase.segments.map((segment, index) => (
          <div key={segment.id}>
            {purchase.split && (
              <div className="px-6 py-3 bg-muted border-y border-border flex items-baseline justify-between gap-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("deliveryOf", {
                    index: index + 1,
                    count: purchase.segments.length,
                  })}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {segment.number}
                </span>
              </div>
            )}
            <ul className="divide-y divide-border">
              {segment.items.map((item) => (
                <li key={item.id} className="px-6 py-4 flex gap-4">
                  <div className="relative w-14 h-14 bg-muted rounded-xl flex-shrink-0 overflow-hidden">
                    <ProductImage
                      src={item.thumbnail_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      iconClassName="w-6 h-6"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground">
                      {item.name}
                    </h3>
                    {item.options_text && (
                      <p className="text-sm text-muted-foreground">
                        {item.options_text}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {t("qty", { quantity: item.quantity })}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {formatMoney(lineItemAmount(item), item.currency)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Totals */}
        <div className="px-6 py-4 border-t border-border">
          <OrderTotals order={purchase.totals} />
        </div>
      </div>

      {/* Shipping & Payment */}
      <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Shipping Method */}
          {purchase.fulfillments.length > 0 && (
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {t("shippingMethod")}
              </h3>
              {purchase.fulfillments.map((fulfillment) => (
                <div
                  key={fulfillment.id}
                  className="flex items-start gap-3 mb-2 last:mb-0"
                >
                  <Package className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {fulfillment.delivery_method?.name ||
                        t("standardShipping")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatMoney(fulfillment.cost, purchase.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Information */}
          {purchase.payments.length > 0 && (
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {t("payment")}
              </h3>
              {purchase.payments
                .filter((p) => p.status !== "void" && p.status !== "invalid")
                .map((payment) => (
                  <div key={payment.id} className="mb-3 last:mb-0">
                    <PaymentInfo
                      payment={payment}
                      currency={purchase.currency}
                      giftCardTotal={purchase.totals.gift_card_total}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact & Addresses */}
      <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {purchase.shipping_address && (
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {t("shippingAddress")}
              </h3>
              <AddressBlock address={purchase.shipping_address} />
            </div>
          )}

          {purchase.billing_address && (
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {t("billingAddress")}
              </h3>
              <AddressBlock address={purchase.billing_address} />
            </div>
          )}
        </div>

        {purchase.email && (
          <div className="px-6 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {t("confirmationSentTo")}{" "}
              <span className="font-medium text-foreground/90">
                {purchase.email}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="text-center">
        <Button size="lg" asChild>
          <Link href={`${basePath}/`}>{tc("continueShopping")}</Link>
        </Button>
      </div>
    </div>
  );
}

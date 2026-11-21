"use client";

import type { Cart } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { ProductImage } from "@/components/ui/product-image";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { lineItemAmount } from "@/lib/utils/price";

interface SummaryProps {
  cart: Cart;
}

export function Summary({ cart }: SummaryProps) {
  const tc = useTranslations("common");
  const t = useTranslations("checkout");
  const formatMoney = useFormatMoney();
  const items = cart.items || [];
  const hasShipping = (cart.fulfillments?.length ?? 0) > 0;

  return (
    <div>
      {/* Line items */}
      <div className="space-y-4 pb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="relative w-[64px] h-[64px] flex-shrink-0">
              <div className="relative w-full h-full rounded-lg overflow-hidden border border-border bg-muted">
                <ProductImage
                  src={item.thumbnail_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                  iconClassName="w-6 h-6"
                />
              </div>
              {/* Quantity badge — Shopify style: top-right, dark bg */}
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background text-[11px] font-medium rounded-full flex items-center justify-center">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">
                {item.name}
              </p>
              {item.options_text && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.options_text}
                </p>
              )}
            </div>
            <div className="text-sm text-foreground">
              {formatMoney(
                item.discounted_amount ?? lineItemAmount(item),
                item.currency,
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Totals — Shopify style */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{tc("subtotal")}</span>
          <span className="text-foreground">
            {formatMoney(cart.item_total, cart.currency)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{tc("shipping")}</span>
          {hasShipping ? (
            <span className="text-foreground">
              {formatMoney(cart.delivery_total, cart.currency)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {t("enterShippingAddress")}
            </span>
          )}
        </div>

        {cart.discount_total && parseFloat(cart.discount_total) !== 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tc("discount")}</span>
            <span className="text-success">
              {formatMoney(cart.discount_total, cart.currency)}
            </span>
          </div>
        )}

        {parseFloat(cart.tax_total ?? "0") > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tc("tax")}</span>
            <span className="text-foreground">
              {formatMoney(cart.tax_total, cart.currency)}
            </span>
          </div>
        )}

        {/* Total row */}
        <div className="flex justify-between items-baseline pt-3 border-t border-border">
          <span className="text-base font-bold text-foreground">
            {tc("total")}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground uppercase">
              {cart.currency}
            </span>
            <span className="text-xl font-bold text-foreground">
              {formatMoney(cart.total, cart.currency)}
            </span>
          </div>
        </div>

        {/* Below the total, reducing the amount due. Store credit excludes
            what a gift card paid, so both rows can show. */}
        {parseFloat(cart.gift_card_total ?? "0") > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tc("giftCard")}</span>
            <span className="text-success">
              -{formatMoney(cart.gift_card_total, cart.currency)}
            </span>
          </div>
        )}
        {parseFloat(cart.store_credit_total ?? "0") > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{tc("storeCredit")}</span>
            <span className="text-success">
              -{formatMoney(cart.store_credit_total, cart.currency)}
            </span>
          </div>
        )}

        {/* Amount due — only shown when gift card or store credit is applied */}
        {cart.amount_due &&
          cart.amount_due !== cart.total &&
          parseFloat(cart.amount_due) > 0 && (
            <div className="flex justify-between items-baseline pt-2 border-t border-border">
              <span className="text-base font-bold text-foreground">
                {tc("amountDue")}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground uppercase">
                  {cart.currency}
                </span>
                <span className="text-xl font-bold text-foreground">
                  {formatMoney(cart.amount_due, cart.currency)}
                </span>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

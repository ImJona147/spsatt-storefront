import type { Cart, Order, OrderGroup } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { useFormatMoney } from "@/hooks/useFormatMoney";

type OrderLike = Cart | Order | OrderGroup;

interface OrderTotalsProps {
  order: OrderLike;
}

export function OrderTotals({ order }: OrderTotalsProps) {
  const t = useTranslations("common");
  const formatMoney = useFormatMoney();

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{t("subtotal")}</span>
        <span className="text-foreground">
          {formatMoney(order.item_total, order.currency)}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{t("shipping")}</span>
        <span className="text-foreground">
          {formatMoney(order.delivery_total, order.currency)}
        </span>
      </div>

      {order.discount_total &&
        Number.parseFloat(order.discount_total) !== 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("discount")}</span>
            <span className="text-emerald-700 dark:text-emerald-400">
              {formatMoney(order.discount_total, order.currency)}
            </span>
          </div>
        )}

      {Number.parseFloat(order.tax_total ?? "0") > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("tax")}</span>
          <span className="text-foreground">
            {formatMoney(order.tax_total, order.currency)}
          </span>
        </div>
      )}

      <div className="flex justify-between border-t border-border pt-2">
        <span className="font-semibold text-foreground">{t("total")}</span>
        <span className="font-semibold text-foreground">
          {formatMoney(order.total, order.currency)}
        </span>
      </div>

      {/* Store credit excludes what a gift card paid, so both rows can show. */}
      {Number.parseFloat(order.gift_card_total ?? "0") > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("giftCard")}</span>
          <span className="text-emerald-700 dark:text-emerald-400">
            -{formatMoney(order.gift_card_total, order.currency)}
          </span>
        </div>
      )}
      {Number.parseFloat(order.store_credit_total ?? "0") > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("storeCredit")}</span>
          <span className="text-emerald-700 dark:text-emerald-400">
            -{formatMoney(order.store_credit_total, order.currency)}
          </span>
        </div>
      )}

      {Number.parseFloat(order.amount_due ?? "0") > 0 &&
        order.amount_due !== order.total && (
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-semibold text-foreground">
              {t("amountDue")}
            </span>
            <span className="font-semibold text-foreground">
              {formatMoney(order.amount_due, order.currency)}
            </span>
          </div>
        )}
    </div>
  );
}

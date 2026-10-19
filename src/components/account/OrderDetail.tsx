import type { Order } from "@spree/sdk";
import { formatMoney } from "@spree/sdk";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AddressBlock } from "@/components/order/AddressBlock";
import { FulfillmentBlock } from "@/components/order/FulfillmentBlock";
import { LineItemCard } from "@/components/order/LineItemCard";
import { OrderTotals } from "@/components/order/OrderTotals";
import { PaymentInfo } from "@/components/order/PaymentInfo";
import { formatDateTime } from "@/lib/utils/format";

interface OrderDetailProps {
  order: Order;
  basePath: string;
  locale: string;
}

export async function OrderDetail({
  order,
  basePath,
  locale,
}: OrderDetailProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "orders",
  });
  const hasFulfillments = order.fulfillments && order.fulfillments.length > 0;

  return (
    <div>
      <Link
        href={`${basePath}/account/orders`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t("backToOrders")}
      </Link>

      <header className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {t("orderTitle", { number: order.number })}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("placedOn", { date: formatDateTime(order.completed_at, locale) })}
        </p>
      </header>

      {hasFulfillments ? (
        order.fulfillments.map((fulfillment) => {
          const manifestItemIds = new Set(
            fulfillment.items?.map((i) => i.item_id) ?? [],
          );
          const fulfillmentLineItems =
            manifestItemIds.size > 0
              ? (order.items || []).filter((item) =>
                  manifestItemIds.has(item.id),
                )
              : order.items || [];

          return (
            <FulfillmentBlock
              key={fulfillment.id}
              fulfillment={fulfillment}
              shipAddress={order.shipping_address}
              basePath={basePath}
              lineItems={fulfillmentLineItems}
            />
          );
        })
      ) : (
        <div className="mb-4 overflow-hidden rounded-xl border bg-card">
          <div className="divide-y divide-border">
            {order.items?.map((item) => (
              <div key={item.id} className="px-4 py-4 sm:px-6">
                <LineItemCard item={item} basePath={basePath} />
              </div>
            ))}
          </div>
        </div>
      )}

      {order.customer_note && (
        <div className="mb-4 rounded-xl border bg-card p-4 sm:p-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            {t("specialInstructions")}
          </h2>
          <p className="text-sm text-foreground">{order.customer_note}</p>
        </div>
      )}

      <div className="mb-4 overflow-hidden rounded-xl border bg-card">
        <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          {order.billing_address && (
            <div className="p-4 sm:p-6">
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                {t("billingAddress")}
              </h2>
              <AddressBlock address={order.billing_address} />
            </div>
          )}
          {order.payments && order.payments.length > 0 && (
            <div className="p-4 sm:p-6">
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                {t("paymentInformation")}
              </h2>
              {order.payments
                .filter((p) => p.status !== "void" && p.status !== "invalid")
                .map((payment) => (
                  <div key={payment.id} className="mb-3 last:mb-0">
                    <PaymentInfo
                      payment={payment}
                      currency={order.currency}
                      giftCardTotal={order.gift_card_total}
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatMoney(payment.amount, order.currency, locale)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <OrderTotals order={order} />
      </div>
    </div>
  );
}

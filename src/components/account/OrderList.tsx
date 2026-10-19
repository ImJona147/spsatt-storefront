import type { Order } from "@spree/sdk";
import { formatMoney } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  getFulfillmentStatusColor,
  getPaymentStatusColor,
  getStatusLabel,
} from "@/lib/utils/format";

interface OrderListProps {
  orders: Order[];
  basePath: string;
  locale: string;
}

function StatusBadge({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${className}`}
    >
      {children}
    </span>
  );
}

export async function OrderList({ orders, basePath, locale }: OrderListProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "orders",
  });

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {/* Mobile: stacked cards */}
      <ul className="divide-y md:hidden">
        {orders.map((order) => {
          const href = `${basePath}/account/orders/${order.id}`;
          return (
            <li key={order.id}>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Button variant="link" size="sm" asChild className="p-0">
                      <Link href={href}>#{order.number}</Link>
                    </Button>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {formatDate(order.completed_at, "-", locale)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-foreground">
                    {formatMoney(order.total, order.currency, locale)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    className={getPaymentStatusColor(order.payment_status)}
                  >
                    {getStatusLabel(order.payment_status ?? null, t)}
                  </StatusBadge>
                  <StatusBadge
                    className={getFulfillmentStatusColor(
                      order.fulfillment_status,
                    )}
                  >
                    {getStatusLabel(order.fulfillment_status ?? null, t)}
                  </StatusBadge>
                </div>
                <Button variant="outline" size="sm" asChild className="w-fit">
                  <Link href={href}>{t("view")}</Link>
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("order")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("date")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("payment")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("shipment")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("totalColumn")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="transition-colors hover:bg-muted/50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button variant="link" size="sm" asChild className="p-0">
                    <Link href={`${basePath}/account/orders/${order.id}`}>
                      #{order.number}
                    </Link>
                  </Button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(order.completed_at, "-", locale)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    className={getPaymentStatusColor(order.payment_status)}
                  >
                    {getStatusLabel(order.payment_status ?? null, t)}
                  </StatusBadge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    className={getFulfillmentStatusColor(
                      order.fulfillment_status,
                    )}
                  >
                    {getStatusLabel(order.fulfillment_status ?? null, t)}
                  </StatusBadge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-foreground">
                  {formatMoney(order.total, order.currency, locale)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Button variant="link" size="sm" asChild>
                    <Link href={`${basePath}/account/orders/${order.id}`}>
                      {t("view")}
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

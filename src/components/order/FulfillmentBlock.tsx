"use client";

import type { Address, Fulfillment, Order } from "@spree/sdk";
import { CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { AddressBlock } from "@/components/order/AddressBlock";
import { LineItemCard } from "@/components/order/LineItemCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getFulfillmentStatusColor, getStatusLabel } from "@/lib/utils/format";

interface FulfillmentBlockProps {
  fulfillment: Fulfillment;
  shipAddress: Address | null;
  basePath: string;
  lineItems: Order["items"];
}

// Statuses that no longer wait for tracking details; the 5.6 `shipped` too,
// for orders saved before the upgrade.
const HANDED_OVER_STATUSES = new Set([
  "canceled",
  "fulfilled",
  "delivered",
  "shipped",
]);

export function FulfillmentBlock({
  fulfillment,
  shipAddress,
  basePath,
  lineItems,
}: FulfillmentBlockProps) {
  const t = useTranslations("orders");
  return (
    <div className="mb-4 overflow-hidden rounded-xl border bg-card">
      <div className="border-b p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {shipAddress && (
            <div className="lg:w-1/2">
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                {t("deliveryAddress")}
              </h2>
              <AddressBlock address={shipAddress} />
            </div>
          )}
          <div className="lg:flex lg:w-1/2 lg:justify-between">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                {t("shippingMethod")}
              </h2>
              <p className="text-sm text-foreground">
                {fulfillment.delivery_method?.name || t("canceled")}
              </p>
              {fulfillment.stock_location && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("shippedFrom", {
                    location: fulfillment.stock_location.name,
                  })}
                </p>
              )}
              <span
                className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${getFulfillmentStatusColor(fulfillment.status)}`}
              >
                {getStatusLabel(fulfillment.status, t)}
              </span>
            </div>
            <div className="mt-4 lg:mt-0">
              {fulfillment.status !== "canceled" && fulfillment.tracking_url ? (
                <Button size="sm" asChild>
                  <a
                    href={fulfillment.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("trackItems")}
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  {t("trackItems")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {fulfillment.status === "canceled" && !fulfillment.fulfilled_at && (
          <Alert variant="destructive" className="mt-3">
            <CircleAlert />
            <AlertDescription>{t("shipmentCanceledRefund")}</AlertDescription>
          </Alert>
        )}
        {!HANDED_OVER_STATUSES.has(fulfillment.status) &&
          !fulfillment.tracking && (
            <div className="mt-3 rounded-lg bg-muted px-3 py-2.5 text-center text-sm text-muted-foreground">
              {t("noTrackingInfo")}
            </div>
          )}
      </div>

      <div className="divide-y divide-border">
        {lineItems.map((item) => (
          <div key={item.id} className="px-4 py-4 sm:px-6">
            <LineItemCard item={item} basePath={basePath} />
          </div>
        ))}
      </div>
    </div>
  );
}

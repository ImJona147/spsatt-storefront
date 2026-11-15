"use client";

import type { Fulfillment } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormatMoney } from "@/hooks/useFormatMoney";

interface DeliveryMethodSectionProps {
  fulfillments: Fulfillment[];
  /** The cart's currency; delivery rates carry none of their own. */
  currency: string;
  onDeliveryRateSelect: (
    fulfillmentId: string,
    rateId: string,
  ) => Promise<void>;
  processing: boolean;
  errors?: string[];
}

export function DeliveryMethodSection({
  fulfillments,
  currency,
  onDeliveryRateSelect,
  processing,
  errors,
}: DeliveryMethodSectionProps) {
  const t = useTranslations("checkout");
  const formatMoney = useFormatMoney();

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-3">
        {t("shippingMethod")}
      </h2>

      {errors && errors.length > 0 && (
        <div className="rounded-sm border border-destructive/50 bg-destructive/10 px-4 py-3 mb-3">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-destructive">
              {error}
            </p>
          ))}
        </div>
      )}

      {fulfillments.length === 0 ? (
        <div className="rounded-sm bg-muted px-4 py-3.5 text-sm text-muted-foreground">
          {t("enterShippingAddressForMethods")}
        </div>
      ) : (
        <div className="space-y-2">
          {fulfillments.map((fulfillment, index) => {
            const selectedRate = fulfillment.delivery_rates.find(
              (r) => r.selected,
            );
            return (
              <div key={fulfillment.id}>
                {fulfillments.length > 1 && (
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {t("shipmentOf", {
                      current: index + 1,
                      total: fulfillments.length,
                    })}
                    {fulfillment.stock_location?.name && (
                      <span className="font-normal">
                        {" "}
                        &mdash;{" "}
                        {t("shipsFrom", {
                          location: fulfillment.stock_location.name,
                        })}
                      </span>
                    )}
                  </p>
                )}
                <RadioGroup
                  value={selectedRate?.id ?? ""}
                  onValueChange={(rateId) =>
                    onDeliveryRateSelect(fulfillment.id, rateId)
                  }
                  disabled={processing}
                  className="rounded-sm border overflow-hidden gap-0"
                >
                  {fulfillment.delivery_rates.map((rate, rateIndex) => (
                    <label
                      key={rate.id}
                      className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors ${
                        rate.selected
                          ? "bg-primary/10"
                          : "bg-card hover:bg-muted"
                      } ${rateIndex > 0 ? "border-t" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={rate.id} />
                        <span className="text-sm text-foreground">
                          {rate.name}
                        </span>
                      </div>
                      <span className="text-sm text-foreground">
                        {formatMoney(rate.cost, currency)}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

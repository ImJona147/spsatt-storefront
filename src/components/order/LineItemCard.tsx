"use client";

import type { Order } from "@spree/sdk";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ProductImage } from "@/components/ui/product-image";
import { useFormatMoney } from "@/hooks/useFormatMoney";

interface LineItemCardProps {
  item: Order["items"][number];
  basePath: string;
}

export function LineItemCard({ item, basePath }: LineItemCardProps) {
  const t = useTranslations("orders");
  const formatMoney = useFormatMoney();
  return (
    <div className="flex gap-4">
      <Link
        href={`${basePath}/products/${item.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-24"
      >
        <ProductImage
          src={item.thumbnail_url}
          alt={item.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`${basePath}/products/${item.slug}`}
          className="line-clamp-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {item.name}
        </Link>
        <div className="mt-1 text-sm text-foreground">
          {formatMoney(item.price, item.currency, { unitPrice: true })}
        </div>
        {item.options_text && (
          <p className="mt-1 text-xs text-muted-foreground">
            {item.options_text}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {t("qty", { quantity: item.quantity })}
        </p>
        <Link
          href={`${basePath}/products/${item.slug}`}
          className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary"
        >
          {t("orderAgain")}
        </Link>
      </div>

      <div className="shrink-0 text-sm font-medium text-foreground">
        {formatMoney(item.total, item.currency)}
      </div>
    </div>
  );
}

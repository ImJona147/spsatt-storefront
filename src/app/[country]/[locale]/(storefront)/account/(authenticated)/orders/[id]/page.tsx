import { isOrderGroup } from "@spree/sdk";
import Link from "next/link";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { OrderDetail } from "@/components/account/OrderDetail";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/lib/data/orders";

interface OrderDetailPageProps {
  params: Promise<{
    country: string;
    locale: string;
    id: string;
  }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  await connection();
  const { country, locale, id } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "orders",
  });
  const basePath = `/${country}/${locale}`;
  const order = await getOrder(id);

  // Account pages link to single orders by their id; an order group only
  // comes back for a cart id, which is not an order of this account.
  if (!order || isOrderGroup(order) || order.completed_at === null) {
    return (
      <div className="rounded-xl border bg-card px-6 py-8 text-center">
        <h1 className="text-base font-semibold text-foreground">
          {t("orderNotFound")}
        </h1>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          {t("orderNotFoundDescription")}
        </p>
        <Button variant="outline" asChild className="mt-5">
          <Link href={`${basePath}/account/orders`}>{t("backToOrders")}</Link>
        </Button>
      </div>
    );
  }

  return <OrderDetail order={order} basePath={basePath} locale={locale} />;
}

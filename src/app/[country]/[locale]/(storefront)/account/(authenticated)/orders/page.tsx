import Link from "next/link";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { OrderList } from "@/components/account/OrderList";
import { Button } from "@/components/ui/button";
import { EmptyIllustration } from "@/components/ui/empty-illustration";
import { getOrders } from "@/lib/data/orders";

interface OrdersPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  await connection();
  const { country, locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "orders",
  });
  const ta = await getTranslations({
    locale: locale as Locale,
    namespace: "account",
  });
  const basePath = `/${country}/${locale}`;

  const response = await getOrders({ limit: 50 });
  const orders = response.data.filter((order) => order.completed_at !== null);

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {t("orderHistory")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ta("orderHistoryDescription")}
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-8 text-center">
          <EmptyIllustration className="mx-auto mb-4 w-32" />
          <h2 className="text-base font-semibold text-foreground">
            {t("noOrders")}
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            {t("noOrdersDescription")}
          </p>
          <Button asChild className="mt-5">
            <Link href={`${basePath}/products`}>{t("startShopping")}</Link>
          </Button>
        </div>
      ) : (
        <OrderList orders={orders} basePath={basePath} locale={locale} />
      )}
    </div>
  );
}

import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { AddressManagement } from "@/components/addresses/AddressManagement";
import { EmptyIllustration } from "@/components/ui/empty-illustration";
import type { User } from "@/contexts/AuthContext";
import { getAddresses } from "@/lib/data/addresses";
import { getCustomer } from "@/lib/data/customer";
import { getMarketCountries, resolveMarket } from "@/lib/data/markets";

interface AddressesPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function AddressesPage({ params }: AddressesPageProps) {
  await connection();
  const { country: urlCountry, locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "account",
  });
  const [addressResponse, market, customer] = await Promise.all([
    getAddresses(),
    resolveMarket(urlCountry).catch(() => null),
    getCustomer().catch(() => null),
  ]);

  const countriesResponse = market
    ? await getMarketCountries(market.id).catch(() => ({ data: [] }))
    : { data: [] };

  const addresses = addressResponse.data;
  const countries = countriesResponse.data;
  const user: User | undefined = customer
    ? {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      }
    : undefined;

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {t("addresses")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("addressesDescription")}
        </p>
      </header>

      {addresses.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-8 text-center">
          <EmptyIllustration className="mx-auto mb-4 w-32" />
          <h2 className="text-base font-semibold text-foreground">
            {t("noAddresses")}
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            {t("noAddressesDescription")}
          </p>
          <div className="mt-5">
            <AddressManagement
              initialAddresses={addresses}
              countries={countries}
              showAddButton={true}
              emptyState={true}
              user={user}
            />
          </div>
        </div>
      ) : (
        <AddressManagement
          initialAddresses={addresses}
          countries={countries}
          showAddButton={true}
          emptyState={false}
          user={user}
        />
      )}
    </div>
  );
}

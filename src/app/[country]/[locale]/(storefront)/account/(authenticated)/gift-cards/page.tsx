import { Gift, Info } from "lucide-react";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { GiftCardList } from "@/components/account/GiftCardList";
import { getGiftCards } from "@/lib/data/gift-cards";

interface GiftCardsPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function GiftCardsPage({ params }: GiftCardsPageProps) {
  await connection();
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "giftCards",
  });
  const response = await getGiftCards();
  const cards = response.data;

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {t("giftCards")}
        </h1>
      </header>

      {cards.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Gift className="size-6 text-primary" aria-hidden />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            {t("noGiftCards")}
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            {t("noGiftCardsDescription")}
          </p>
        </div>
      ) : (
        <GiftCardList cards={cards} />
      )}

      <div className="mt-5 rounded-xl border bg-muted/50 p-3.5">
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t("giftCardsHelpText")}
        </p>
      </div>
    </div>
  );
}

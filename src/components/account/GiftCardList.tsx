"use client";

import type { GiftCard } from "@spree/sdk";
import { Check, ClipboardCopy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { formatDate } from "@/lib/utils/format";

function getStateColor(state: string, expired: boolean): string {
  if (expired) return "bg-muted text-muted-foreground";
  switch (state) {
    case "active":
      return "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400";
    case "partially_redeemed":
      return "bg-amber-500/12 text-amber-700 dark:text-amber-400";
    case "redeemed":
      return "bg-muted text-muted-foreground";
    case "canceled":
      return "bg-red-500/12 text-red-700 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStateLabel(
  state: string,
  t: ReturnType<typeof useTranslations<"giftCards">>,
): string {
  switch (state) {
    case "active":
      return t("active");
    case "partially_redeemed":
      return t("partiallyUsed");
    case "redeemed":
      return t("fullyRedeemed");
    case "canceled":
      return t("canceled");
    case "expired":
      return t("expired");
    default:
      return state;
  }
}

function CopyButton({ code }: { code: string }) {
  const t = useTranslations("giftCards");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      title={t("copyCodeToClipboard")}
    >
      {copied ? (
        <>
          <Check className="size-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-emerald-700 dark:text-emerald-400">
            {t("copied")}
          </span>
        </>
      ) : (
        <>
          <ClipboardCopy className="size-4" />
          <span>{t("copy")}</span>
        </>
      )}
    </Button>
  );
}

function GiftCardItem({ card }: { card: GiftCard }) {
  const t = useTranslations("giftCards");
  const locale = useLocale();
  const formatMoney = useFormatMoney();
  const usagePercentage =
    Number(card.amount) > 0
      ? Math.round((Number(card.amount_used) / Number(card.amount)) * 100)
      : 0;

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-lg font-semibold text-foreground">
              {card.code}
            </span>
            <CopyButton code={card.code} />
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getStateColor(card.status, card.expired)}`}
            >
              {getStateLabel(card.status, t)}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {card.expires_at
              ? t("expiresOn", {
                  date: formatDate(card.expires_at, "-", locale),
                })
              : t("noExpiration")}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-bold text-foreground">
            {formatMoney(card.amount_remaining, card.currency)}
          </p>
          <p className="text-sm text-muted-foreground">{t("remaining")}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            {t("usedAmount", {
              amount: formatMoney(card.amount_used, card.currency),
            })}
          </span>
          <span className="text-muted-foreground">
            {t("totalAmountWithValue", {
              amount: formatMoney(card.amount, card.currency),
            })}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={Math.min(usagePercentage, 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("percentUsed", { percent: usagePercentage })}
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={`h-full rounded-full transition-all ${
              usagePercentage >= 100 ? "bg-muted-foreground/40" : "bg-primary"
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("percentUsed", { percent: usagePercentage })}
        </p>
      </div>

      {card.redeemed_at && (
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            {t("fullyRedeemedOnDate", {
              date: formatDate(card.redeemed_at, "-", locale),
            })}
          </p>
        </div>
      )}
    </div>
  );
}

interface GiftCardListProps {
  cards: GiftCard[];
}

export function GiftCardList({ cards }: GiftCardListProps) {
  const t = useTranslations("giftCards");
  const activeCards = cards.filter((c) => c.active && !c.expired);
  const inactiveCards = cards.filter((c) => !c.active || c.expired);

  return (
    <>
      {activeCards.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {t("activeGiftCardsCount", { count: activeCards.length })}
          </h2>
          <div className="space-y-4">
            {activeCards.map((card) => (
              <GiftCardItem key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}

      {inactiveCards.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
            {t("expiredRedeemedCount", { count: inactiveCards.length })}
          </h2>
          <div className="space-y-4 opacity-75">
            {inactiveCards.map((card) => (
              <GiftCardItem key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

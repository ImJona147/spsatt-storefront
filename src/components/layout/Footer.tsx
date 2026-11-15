import type { Category } from "@spree/sdk";
import { MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import {
  BUSINESS_ADDRESS,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
  BUSINESS_WHATSAPP_MESSAGE,
  buildWhatsAppUrl,
} from "@/lib/constants/business";
import { POLICY_LINKS } from "@/lib/constants/policies";
import { getStore } from "@/lib/data/store";
import { isMarketplaceEnabled, isWholesaleEnabled } from "@/lib/spree";
import { CurrentYear } from "./CurrentYear";

interface FooterProps {
  basePath: string;
  locale: Locale;
  categoryLinks: ReactNode;
}

interface FooterCategoryLinksProps {
  rootCategories: Category[];
  basePath: string;
}

export function FooterCategoryLinks({
  rootCategories,
  basePath,
}: FooterCategoryLinksProps) {
  return rootCategories.map((category) => (
    <li key={category.id} className="min-w-0">
      <Link
        href={`${basePath}/c/${category.permalink}`}
        className="inline-flex min-h-9 items-center text-sm leading-5 text-primary-foreground/90 transition-colors hover:text-primary-foreground hover:underline underline-offset-4"
      >
        {category.name}
      </Link>
    </li>
  ));
}

export async function Footer({ basePath, locale, categoryLinks }: FooterProps) {
  const [t, tp, { name: storeName }] = await Promise.all([
    getTranslations({ locale, namespace: "footer" }),
    getTranslations({ locale, namespace: "policies" }),
    getStore(locale),
  ]);
  const wholesaleEnabled = isWholesaleEnabled();
  const marketplaceEnabled = isMarketplaceEnabled();
  const linkClass =
    "inline-flex min-h-9 items-center text-sm leading-5 text-primary-foreground/90 transition-colors hover:text-primary-foreground hover:underline underline-offset-4";
  const contactLinkClass =
    "inline-flex min-h-10 items-center gap-2 text-sm text-primary-foreground transition-colors hover:text-primary-foreground/80";

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-9 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(15rem,0.9fr)_minmax(0,1.8fr)] lg:gap-14">
          <div className="min-w-0">
            <Link
              href={basePath || "/"}
              className="inline-flex text-xl font-semibold tracking-tight text-primary-foreground transition-opacity hover:opacity-85"
            >
              {storeName}
            </Link>
            <p className="mt-2 max-w-lg text-sm leading-6 text-primary-foreground/90">
              {t("description")}
            </p>
            <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
              <li>
                <a
                  href={buildWhatsAppUrl(BUSINESS_WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noreferrer"
                  className={contactLinkClass}
                >
                  <MessageCircle aria-hidden className="size-4" />
                  {t("whatsapp")}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${BUSINESS_PHONE_TEL}`}
                  className={contactLinkClass}
                >
                  {BUSINESS_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <Link
                  href={`${basePath}#contact`}
                  className={`${contactLinkClass} font-medium underline underline-offset-4`}
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
            <p className="mt-1 flex items-start gap-2 text-sm leading-5 text-primary-foreground/90">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>{BUSINESS_ADDRESS}</span>
            </p>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-[1.35fr_0.8fr_1fr] xl:gap-8">
            <div className="sm:col-span-2 xl:col-span-1">
              <h2 className="text-xs font-semibold tracking-wide text-primary-foreground">
                {t("shop")}
              </h2>
              <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5">
                <li>
                  <Link href={`${basePath}/products`} className={linkClass}>
                    {t("allProducts")}
                  </Link>
                </li>
                <li>
                  <Link href={`${basePath}/portafolio`} className={linkClass}>
                    {t("portfolio")}
                  </Link>
                </li>
                <li>
                  <Link href={`${basePath}/collections`} className={linkClass}>
                    {t("collections")}
                  </Link>
                </li>
                {marketplaceEnabled && (
                  <li>
                    <Link href={`${basePath}/sellers`} className={linkClass}>
                      {t("sellers")}
                    </Link>
                  </li>
                )}
                {categoryLinks}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold tracking-wide text-primary-foreground">
                {t("account")}
              </h2>
              <ul className="mt-2 space-y-0.5">
                <li>
                  <Link href={`${basePath}/account`} className={linkClass}>
                    {t("myAccount")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${basePath}/account/orders`}
                    className={linkClass}
                  >
                    {t("orderHistory")}
                  </Link>
                </li>
                <li>
                  <Link href={`${basePath}/cart`} className={linkClass}>
                    {t("cart")}
                  </Link>
                </li>
                {wholesaleEnabled && (
                  <li>
                    <Link href={`${basePath}/wholesale`} className={linkClass}>
                      {t("wholesale")}
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold tracking-wide text-primary-foreground">
                {t("policies")}
              </h2>
              <ul className="mt-2 space-y-0.5">
                {POLICY_LINKS.map((policy) => (
                  <li key={policy.slug}>
                    <Link
                      href={`${basePath}/policies/${policy.slug}`}
                      className={linkClass}
                    >
                      {tp(policy.nameKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center justify-center gap-x-6 gap-y-1.5 border-t border-primary-foreground/25 pt-4 text-center text-xs leading-5 text-primary-foreground/85 sm:flex-row sm:flex-wrap">
          <p>
            &copy; <CurrentYear /> {storeName}. {t("rights")}
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <a
              href="https://spreecommerce.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:text-primary-foreground hover:underline"
            >
              {t("poweredBySpree")}
            </a>
            <a
              href="https://storyset.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:text-primary-foreground hover:underline"
            >
              {t("illustrationsByStoryset")}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

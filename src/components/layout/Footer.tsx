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
import { isWholesaleEnabled } from "@/lib/spree";
import { getStoreDescription, getStoreName } from "@/lib/store";
import { CurrentYear } from "./CurrentYear";

const storeName = getStoreName();
const storeDescription = getStoreDescription();

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
    <li key={category.id}>
      <Link
        href={`${basePath}/c/${category.permalink}`}
        className="text-sm text-primary-foreground/95 hover:text-primary-foreground transition-colors"
      >
        {category.name}
      </Link>
    </li>
  ));
}

export async function Footer({ basePath, locale, categoryLinks }: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tp = await getTranslations({ locale, namespace: "policies" });
  const wholesaleEnabled = isWholesaleEnabled();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <span className="text-xl font-bold text-primary-foreground">
              {storeName}
            </span>
            <p className="mt-4 max-w-md text-sm text-primary-foreground/95">
              {t("description") || storeDescription}
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-primary-foreground/95">
              <li>
                <a
                  href={buildWhatsAppUrl(BUSINESS_WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary-foreground transition-colors"
                >
                  <MessageCircle aria-hidden className="size-4" />
                  {t("whatsapp")}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${BUSINESS_PHONE_TEL}`}
                  className="hover:text-primary-foreground transition-colors"
                >
                  {BUSINESS_PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-primary-foreground"
                />
                {BUSINESS_ADDRESS}
              </li>
              <li>
                <Link
                  href={`${basePath}#contact`}
                  className="font-medium text-primary-foreground hover:underline underline-offset-4 transition-colors"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary-foreground">
              {t("shop")}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`${basePath}/products`}
                  className="text-sm text-primary-foreground/95 hover:text-primary-foreground transition-colors"
                >
                  {t("allProducts")}
                </Link>
              </li>
              <li>
                <Link
                  href={`${basePath}/portafolio`}
                  className="text-sm text-primary-foreground/95 hover:text-primary-foreground transition-colors"
                >
                  {t("portfolio")}
                </Link>
              </li>
              {categoryLinks}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary-foreground">
              {t("account")}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`${basePath}/account`}
                  className="text-sm text-primary-foreground/95 hover:text-primary-foreground transition-colors"
                >
                  {t("myAccount")}
                </Link>
              </li>
              <li>
                <Link
                  href={`${basePath}/account/orders`}
                  className="text-sm text-primary-foreground/95 hover:text-primary-foreground transition-colors"
                >
                  {t("orderHistory")}
                </Link>
              </li>
              <li>
                <Link
                  href={`${basePath}/cart`}
                  className="text-sm text-primary-foreground/95 hover:text-primary-foreground transition-colors"
                >
                  {t("cart")}
                </Link>
              </li>
              {wholesaleEnabled && (
                <li>
                  <Link
                    href={`${basePath}/wholesale`}
                    className="text-sm text-primary-foreground/95 hover:text-primary-foreground transition-colors"
                  >
                    {t("wholesale")}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary-foreground">
              {t("policies")}
            </h3>
            <ul className="mt-4 space-y-3">
              {POLICY_LINKS.map((policy) => (
                <li key={policy.slug}>
                  <Link
                    href={`${basePath}/policies/${policy.slug}`}
                    className="text-sm text-primary-foreground/95 hover:text-primary-foreground transition-colors"
                  >
                    {tp(policy.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-primary-foreground/30 text-xs text-primary-foreground/95 space-y-1.5">
          <p>
            &copy; <CurrentYear /> {storeName}. {t("rights")}
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
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

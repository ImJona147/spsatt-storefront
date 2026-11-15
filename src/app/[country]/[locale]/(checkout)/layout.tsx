"use client";

import { ArrowLeft, ChevronDown, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MainContent, SkipLink } from "@/components/layout/SkipLink";
import {
  CheckoutProvider,
  CheckoutSummary,
  useCheckout,
} from "@/contexts/CheckoutContext";
import { useStore } from "@/contexts/StoreContext";
import { POLICY_LINKS } from "@/lib/constants/policies";
import { extractBasePath } from "@/lib/utils/path";

function CheckoutHeader() {
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const t = useTranslations("checkoutLayout");
  const { storeName } = useStore();

  return (
    <header className="flex items-center justify-between h-16">
      <Link href={basePath || "/"} className="flex items-center space-x-2">
        <Image
          src="/spsatt.svg"
          alt={storeName}
          width={1216}
          height={791}
          className="h-8 w-auto max-w-full object-contain"
          fetchPriority="high"
          loading="eager"
        />
      </Link>
      <Link
        href={basePath || "/"}
        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        aria-label={t("backToStore")}
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        {t("backToStore")}
      </Link>
    </header>
  );
}

function CheckoutFooter() {
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const t = useTranslations("checkoutLayout");
  const tp = useTranslations("policies");
  const { storeName } = useStore();

  return (
    <footer className="py-4 text-xs text-muted-foreground border-t border-border mt-auto flex flex-wrap items-center gap-x-3 gap-y-1">
      <p>
        {t("allRightsReserved", { year: new Date().getFullYear(), storeName })}
      </p>
      {POLICY_LINKS.map((policy) => (
        <Link
          key={policy.slug}
          href={`${basePath}/policies/${policy.slug}`}
          target="_blank"
          className="text-muted-foreground underline hover:text-foreground"
        >
          {tp(policy.nameKey)}
        </Link>
      ))}
    </footer>
  );
}

function MobileSummaryToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("checkoutLayout");
  const { summaryContent } = useCheckout();

  // Hide the toggle entirely when there's no summary to show (e.g. the
  // order-placed page clears summaryContent because the page already
  // displays the order details inline).
  if (summaryContent === null) return null;

  return (
    <div className="lg:hidden border-b border-border bg-muted">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
        aria-expanded={isOpen}
        aria-controls="checkout-summary-panel"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ShoppingBag className="w-5 h-5 text-muted-foreground" />
          {isOpen ? t("hideOrderSummary") : t("showOrderSummary")}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div id="checkout-summary-panel" className="px-5 pb-4">
          <CheckoutSummary />
        </div>
      )}
    </div>
  );
}

interface CheckoutLayoutProps {
  children: React.ReactNode;
}

function CheckoutLayoutContent({ children }: CheckoutLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SkipLink />
      {/* Mobile header */}
      <div className="lg:hidden border-b border-border">
        <div className="px-5">
          <CheckoutHeader />
        </div>
      </div>

      {/* Mobile summary toggle */}
      <MobileSummaryToggle />

      {/* Main checkout grid — Shopify proportions */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,640px)_minmax(0,440px)_1fr]">
        {/* Main content area — white bg */}
        <div className="lg:col-start-2 flex flex-col">
          <div className="flex-1 px-5 py-6 lg:pl-10 lg:pr-12 lg:py-10">
            {/* Desktop header */}
            <div className="hidden lg:block mb-8">
              <CheckoutHeader />
            </div>
            <MainContent>{children}</MainContent>
          </div>
          <div className="px-5 lg:pl-10 lg:pr-12 pb-4">
            <CheckoutFooter />
          </div>
        </div>

        {/* Desktop summary sidebar — Shopify: light gray bg with left border */}
        <div className="hidden lg:block lg:col-start-3 border-l border-border bg-muted/50">
          <div className="sticky top-0 px-10 py-10">
            <CheckoutSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return (
    <CheckoutProvider>
      <CheckoutLayoutContent>{children}</CheckoutLayoutContent>
    </CheckoutProvider>
  );
}

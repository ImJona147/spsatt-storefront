import type { Category, Collection } from "@spree/sdk";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { CartButton } from "@/components/layout/CartButton";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { RegionPreferences } from "@/components/layout/RegionPreferences";
import { SearchToggle } from "@/components/layout/SearchToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { isMarketplaceEnabled, isWholesaleEnabled } from "@/lib/spree";
import { getStoreName } from "@/lib/store";

const storeName = getStoreName();

interface HeaderProps {
  basePath: string;
  locale: Locale;
  mobileNavigation: ReactNode;
}

interface HeaderMobileMenuProps {
  rootCategories: Category[];
  collections?: Collection[];
  basePath: string;
}

export function HeaderMobileMenu({
  rootCategories,
  collections,
  basePath,
}: HeaderMobileMenuProps) {
  return (
    <MobileMenu
      rootCategories={rootCategories}
      collections={collections}
      basePath={basePath}
      wholesaleEnabled={isWholesaleEnabled()}
      marketplaceEnabled={isMarketplaceEnabled()}
    />
  );
}

export async function Header({
  basePath,
  locale,
  mobileNavigation,
}: HeaderProps) {
  const t = await getTranslations({ locale, namespace: "header" });
  const wholesaleEnabled = isWholesaleEnabled();
  const marketplaceEnabled = isMarketplaceEnabled();

  return (
    <SearchToggle
      basePath={basePath}
      left={mobileNavigation}
      center={
        <Link href={basePath || "/"} className="flex items-center min-w-0">
          <Image
            src="/spsatt.svg"
            alt={storeName}
            width={90}
            height={32}
            className="h-20 w-20 max-w-full object-contain "
            fetchPriority="high"
            loading="eager"
          />
        </Link>
      }
      rightStart={
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          <Link
            href={`${basePath}/collections`}
            className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap"
          >
            {t("collections")}
          </Link>
          {marketplaceEnabled && (
            <Link
              href={`${basePath}/sellers`}
              className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              {t("sellers")}
            </Link>
          )}
          {/* Trade portal entry point — understated, secondary to the catalog nav.
              Only shown when the wholesale addon is enabled. */}
          {wholesaleEnabled && (
            <Link
              href={`${basePath}/wholesale`}
              className="px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {t("wholesale")}
            </Link>
          )}
          <RegionPreferences variant="header" />
        </div>
      }
      rightEnd={
        <>
          {/* Light/dark toggle: same row as region, search, account and cart */}
          <ThemeToggle />

          {/* Account - desktop only */}
          <div className="hidden md:block">
            <Button variant="ghost" size="icon-lg" asChild>
              <Link href={`${basePath}/account`} aria-label={t("account")}>
                <User className="size-5" />
              </Link>
            </Button>
          </div>

          {/* Cart */}
          <CartButton />
        </>
      }
    />
  );
}

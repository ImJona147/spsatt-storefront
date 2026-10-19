"use client";

import {
  CreditCard,
  Gift,
  Home,
  LogOut,
  MapPin,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { extractBasePath } from "@/lib/utils/path";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

function getNavItems(
  t: ReturnType<typeof useTranslations<"account">>,
): NavItem[] {
  return [
    { href: "/account", label: t("overview"), icon: Home },
    { href: "/account/orders", label: t("orders"), icon: ShoppingBag },
    { href: "/account/addresses", label: t("addresses"), icon: MapPin },
    {
      href: "/account/credit-cards",
      label: t("paymentMethods"),
      icon: CreditCard,
    },
    { href: "/account/gift-cards", label: t("giftCards"), icon: Gift },
    { href: "/account/profile", label: t("profile"), icon: User },
  ];
}

function isActive(pathname: string, basePath: string, href: string): boolean {
  const full = `${basePath}${href}`;
  return (
    pathname === full || (href !== "/account" && pathname.startsWith(full))
  );
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("account");
  const pathname = usePathname();
  const router = useRouter();
  const basePath = extractBasePath(pathname);
  const { user, logout } = useAuth();
  const navItems = getNavItems(t);

  const name = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : t("myAccount");

  const handleLogout = async () => {
    await logout();
    router.replace(`${basePath}/account`);
  };

  return (
    <div className="container mx-auto flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
        <aside className="lg:sticky lg:top-20 lg:w-56 lg:shrink-0">
          <div className="rounded-xl border bg-card">
            <div className="border-b px-4 py-3">
              <p className="truncate text-sm font-medium text-foreground">
                {name}
              </p>
              {user?.email && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>

            <nav aria-label={t("myAccount")} className="lg:hidden">
              <ul className="grid grid-cols-2 gap-1 p-2">
                {navItems.map((item) => {
                  const href = `${basePath}${item.href}`;
                  const active = isActive(pathname, basePath, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-11 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-primary/12 text-primary"
                            : "text-foreground/85 hover:bg-muted"
                        }`}
                      >
                        <item.icon className="size-4 shrink-0" aria-hidden />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <nav aria-label={t("myAccount")} className="hidden p-2 lg:block">
              <ul className="space-y-0.5">
                {navItems.map((item) => {
                  const href = `${basePath}${item.href}`;
                  const active = isActive(pathname, basePath, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "bg-primary/12 text-primary"
                            : "text-foreground/85 hover:bg-muted"
                        }`}
                      >
                        <item.icon className="size-4 shrink-0" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t p-2">
              <Button
                variant="ghost"
                className="min-h-9 w-full justify-start text-foreground/80"
                onClick={handleLogout}
              >
                <LogOut className="size-4" aria-hidden />
                {t("signOut")}
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

"use client";

import {
  CircleAlert,
  CreditCard,
  Eye,
  EyeOff,
  Gift,
  MapPin,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { resolveAccountRedirect } from "@/lib/utils/account-redirect";
import { extractBasePath } from "@/lib/utils/path";
import LoginSvg from "../../../../../../public/illustrations/login.svg";

function SectionLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof ShoppingBag;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:border-primary/35 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
      >
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </Link>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = extractBasePath(pathname);
  const t = useTranslations("account");
  const tp = useTranslations("profile");
  const { login, user, isAuthenticated, loading: authLoading } = useAuth();

  const redirectUrl = resolveAccountRedirect(
    searchParams.get("redirect"),
    basePath,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } else {
      setError(result.error || t("invalidCredentials"));
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
        <div className="animate-pulse space-y-3">
          <div className="mx-auto h-8 w-1/2 rounded bg-muted" />
          <div className="mx-auto h-4 w-3/4 rounded bg-muted" />
          <div className="h-48 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60svh] items-center">
        <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-6 sm:px-6 sm:py-8 md:grid-cols-2 md:items-center md:gap-10 lg:gap-14">
          <div className="mx-auto w-full max-w-md">
            <h1 className="font-display text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("signIn")}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("signInDescription")}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              {error && (
                <Alert variant="destructive">
                  <CircleAlert />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t("emailPlaceholder")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="current-password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? t("hidePassword") : t("showPassword")
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </Field>

              <div className="flex justify-end">
                <Link
                  href={`${basePath}/account/forgot-password`}
                  className="text-sm font-medium text-primary hover:text-primary/70"
                >
                  {t("forgotPassword")}
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? t("signingIn") : t("signIn")}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("dontHaveAccount")}{" "}
              <Link
                href={`${basePath}/account/register`}
                className="font-medium text-primary hover:text-primary/70"
              >
                {t("signUp")}
              </Link>
            </p>
          </div>

          <div
            aria-hidden
            className="relative hidden items-center justify-center md:flex"
          >
            <div className="absolute inset-4 rounded-full bg-primary/10 blur-3xl" />
            <LoginSvg
              focusable="false"
              className="relative h-auto w-52 text-primary sm:w-64 lg:w-80"
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <AccountShell>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {t("accountOverview")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("signInDescription")}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <SectionLink
            href={`${basePath}/account/orders`}
            icon={ShoppingBag}
            title={t("orderHistory")}
            description={t("orderHistoryDescription")}
          />
          <SectionLink
            href={`${basePath}/account/addresses`}
            icon={MapPin}
            title={t("addresses")}
            description={t("addressesDescription")}
          />
          <SectionLink
            href={`${basePath}/account/credit-cards`}
            icon={CreditCard}
            title={t("paymentMethods")}
            description={t("paymentMethodsDescription")}
          />
          <SectionLink
            href={`${basePath}/account/gift-cards`}
            icon={Gift}
            title={t("giftCards")}
            description={t("giftCardsDescription")}
          />
          <SectionLink
            href={`${basePath}/account/profile`}
            icon={User}
            title={t("profile")}
            description={t("profileDescription")}
          />
        </div>

        <div className="mt-5 rounded-xl border bg-card px-4 py-3.5">
          <h2 className="text-sm font-medium text-foreground">
            {tp("accountInformation")}
          </h2>
          <dl className="mt-2 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4 sm:block">
              <dt className="text-muted-foreground">{tp("email")}</dt>
              <dd className="truncate text-foreground sm:mt-0.5">
                {user?.email ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 sm:block">
              <dt className="text-muted-foreground">{tp("firstName")}</dt>
              <dd className="truncate text-foreground sm:mt-0.5">
                {user?.first_name
                  ? `${user.first_name} ${user.last_name || ""}`.trim()
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </AccountShell>
  );
}

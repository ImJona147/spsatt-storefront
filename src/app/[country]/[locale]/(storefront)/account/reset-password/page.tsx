"use client";

import {
  Check,
  Circle,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  isPasswordValid,
  PasswordChecklist,
} from "@/components/account/PasswordChecklist";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/data/customer";
import { cn } from "@/lib/utils";
import { extractBasePath } from "@/lib/utils/path";
import LoginSvg from "../../../../../../../public/illustrations/login.svg";

function AuthAside() {
  return (
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
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("resetPassword");
  const ta = useTranslations("account");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = extractBasePath(pathname);
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-[60svh] items-center">
        <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-6 sm:px-6 sm:py-8 md:grid-cols-2 md:items-center md:gap-10 lg:gap-14">
          <div className="mx-auto w-full max-w-md">
            <h1 className="font-display text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("invalidLink")}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("invalidLinkDescription")}
            </p>
            <Button
              type="button"
              size="lg"
              className="mt-5 w-full"
              onClick={() => router.push(`${basePath}/account/forgot-password`)}
            >
              {t("requestNewLink")}
            </Button>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link
                href={`${basePath}/account`}
                className="font-medium text-primary hover:text-primary/70"
              >
                {t("backToSignIn")}
              </Link>
            </p>
          </div>
          <AuthAside />
        </section>
      </div>
    );
  }

  const passwordValid = isPasswordValid(password);
  const passwordsMatch =
    passwordConfirmation.length > 0 && password === passwordConfirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      document.getElementById("password-rules")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      document.getElementById("password")?.focus();
      return;
    }

    if (password !== passwordConfirmation) {
      setError(t("passwordsDontMatch"));
      document.getElementById("passwordConfirmation")?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const result = await resetPassword(token, password, passwordConfirmation);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || t("linkExpired"));
      }
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60svh] items-center">
        <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-6 sm:px-6 sm:py-8 md:grid-cols-2 md:items-center md:gap-10 lg:gap-14">
          <div className="mx-auto w-full max-w-md">
            <div
              aria-hidden
              className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10"
            >
              <CircleCheck className="size-6 text-primary" />
            </div>
            <h1 className="font-display text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("success")}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("successDescription")}
            </p>
            <Button
              type="button"
              size="lg"
              className="mt-5 w-full"
              onClick={() => router.push(`${basePath}/account`)}
            >
              {t("signIn")}
            </Button>
          </div>
          <AuthAside />
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60svh] items-center">
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-6 sm:px-6 sm:py-8 md:grid-cols-2 md:items-center md:gap-10 lg:gap-14">
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("description")}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {error && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Field>
              <FieldLabel htmlFor="password">{t("newPassword")}</FieldLabel>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="new-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-describedby="password-rules"
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
                      showPassword ? ta("hidePassword") : ta("showPassword")
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
              <PasswordChecklist password={password} id="password-rules" />
            </Field>

            <Field>
              <FieldLabel htmlFor="passwordConfirmation">
                {t("confirmPassword")}
              </FieldLabel>
              <div className="relative">
                <Input
                  type={showPasswordConfirmation ? "text" : "password"}
                  id="passwordConfirmation"
                  name="new-password"
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setShowPasswordConfirmation(!showPasswordConfirmation)
                    }
                    aria-label={
                      showPasswordConfirmation
                        ? ta("hidePassword")
                        : ta("showPassword")
                    }
                  >
                    {showPasswordConfirmation ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </Button>
                </div>
              </div>
              {passwordConfirmation.length > 0 && (
                <p
                  aria-live="polite"
                  className={cn(
                    "flex items-center gap-2 text-[0.8125rem] leading-tight",
                    passwordsMatch
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {passwordsMatch ? (
                    <Check
                      aria-hidden
                      focusable="false"
                      className="size-4 shrink-0 text-primary"
                    />
                  ) : (
                    <Circle
                      aria-hidden
                      focusable="false"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                  )}
                  {passwordsMatch ? t("passwordsMatch") : t("passwordsNoMatch")}
                </p>
              )}
            </Field>

            <Button
              type="submit"
              disabled={submitting || !passwordValid || !passwordsMatch}
              size="lg"
              className="w-full"
            >
              {submitting ? t("resetting") : t("resetPassword")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href={`${basePath}/account`}
              className="font-medium text-primary hover:text-primary/70"
            >
              {t("backToSignIn")}
            </Link>
          </p>
        </div>

        <AuthAside />
      </section>
    </div>
  );
}

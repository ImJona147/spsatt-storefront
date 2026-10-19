"use client";

import { Check, Circle, CircleAlert, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  isPasswordValid,
  PasswordChecklist,
} from "@/components/account/PasswordChecklist";
import { PolicyConsent } from "@/components/policy/PolicyConsent";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { extractBasePath } from "@/lib/utils/path";
import RegisterSvg from "../../../../../../../public/illustrations/register.svg";

export default function RegisterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const t = useTranslations("register");
  const ta = useTranslations("account");
  const { register, isAuthenticated, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policyConsent, setPolicyConsent] = useState(false);
  const [policyError, setPolicyError] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(`${basePath}/account`);
    }
  }, [authLoading, isAuthenticated, router, basePath]);
  if (authLoading || isAuthenticated) {
    return null;
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

    if (!policyConsent) {
      setPolicyError(true);
      setError(ta("policyConsentRequired"));
      document
        .getElementById("policy-consent")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("policy-consent")?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const result = await register({
        email,
        password,
        password_confirmation: passwordConfirmation,
        ...(firstName && { first_name: firstName }),
        ...(lastName && { last_name: lastName }),
      });
      if (result.success) {
        router.push(`${basePath}/account`);
      } else {
        setError(result.error || t("registrationFailed"));
      }
    } catch {
      setError(t("unexpectedError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[60svh] items-center">
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-6 sm:px-6 sm:py-8 md:grid-cols-2 md:items-center md:gap-10 lg:gap-14">
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("createAccount")}
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("signUpDescription")}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {error && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="firstName">{t("firstName")}</FieldLabel>
                <Input
                  type="text"
                  id="firstName"
                  name="given-name"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder={t("firstNamePlaceholder")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="lastName">{t("lastName")}</FieldLabel>
                <Input
                  type="text"
                  id="lastName"
                  name="family-name"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder={t("lastNamePlaceholder")}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="email">{ta("email")}</FieldLabel>
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
              <FieldLabel htmlFor="password">{ta("password")}</FieldLabel>
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

            <PolicyConsent
              checked={policyConsent}
              onCheckedChange={(checked) => {
                setPolicyConsent(checked);
                if (checked) setPolicyError(false);
              }}
              error={policyError}
            />

            <Button
              type="submit"
              disabled={submitting || !passwordValid || !passwordsMatch}
              size="lg"
              className="w-full"
            >
              {submitting ? t("creatingAccount") : t("createAccount")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href={`${basePath}/account`}
              className="font-medium text-primary hover:text-primary/70"
            >
              {t("signIn")}
            </Link>
          </p>
        </div>

        <div
          aria-hidden
          className="relative hidden items-center justify-center md:flex"
        >
          <div className="absolute inset-4 rounded-full bg-primary/10 blur-3xl" />
          <RegisterSvg
            focusable="false"
            className="relative h-auto w-52 text-primary sm:w-64 lg:w-80"
          />
        </div>
      </section>
    </div>
  );
}

"use client";

import { CircleAlert, CircleCheck, Mail } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/data/customer";
import { extractBasePath } from "@/lib/utils/path";
import QuestionsSvg from "../../../../../../../public/illustrations/questions.svg";

function AuthAside() {
  return (
    <div
      aria-hidden
      className="relative hidden items-center justify-center md:flex"
    >
      <div className="absolute inset-4 rounded-full bg-primary/10 blur-3xl" />
      <QuestionsSvg
        focusable="false"
        className="relative h-auto w-52 text-primary sm:w-64 lg:w-80"
      />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const origin = window.location.origin;
      const redirectUrl = `${origin}${basePath}/account/reset-password`;
      const result = await requestPasswordReset(email, redirectUrl);
      if (result?.message) {
        setSubmitted(true);
      } else {
        setError(t("genericError"));
      }
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
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
              {t("checkYourEmail")}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t.rich("resetEmailSent", {
                email,
                strong: (chunks) => (
                  <strong className="font-medium text-foreground">
                    {chunks}
                  </strong>
                ),
              })}
            </p>

            <div className="mt-5 flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <Mail
                aria-hidden
                focusable="false"
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />
              <p>{t("linkExpiry")}</p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="mt-5 w-full"
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
            >
              {t("tryDifferentEmail")}
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

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full"
            >
              {submitting ? t("sending") : t("sendResetLink")}
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

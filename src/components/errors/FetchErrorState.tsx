"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { extractBasePath } from "@/lib/utils/path";
import Error500Svg from "../../../public/illustrations/error-500.svg";

/**
 * Friendly full-page state shown when a data fetch failed for a reason other
 * than "this record does not exist" (backend hiccup, network). A
 * router.refresh() re-runs the server components without a full reload.
 * Shared by the policies error boundary and the PDP fetch guards.
 */
export function FetchErrorState() {
  const router = useRouter();
  const t = useTranslations("common");
  const tnf = useTranslations("notFound");
  const basePath = extractBasePath(usePathname() ?? "");

  return (
    <div className="flex min-h-[68svh] items-center">
      <section className="mx-auto w-full max-w-xl px-4 py-14 text-center sm:px-6 sm:py-20">
        <div className="relative mx-auto flex w-fit items-center justify-center">
          <div
            aria-hidden
            className="absolute inset-4 rounded-full bg-primary/10 blur-3xl"
          />
          <Error500Svg
            aria-hidden
            focusable="false"
            className="relative h-auto w-52 text-primary sm:w-64 lg:w-72"
          />
        </div>
        <h1 className="mt-8 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("loadErrorTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("loadErrorDescription")}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="gap-2.5 font-semibold"
            onClick={() => router.refresh()}
          >
            <RefreshCw className="size-5" aria-hidden="true" />
            {t("retry")}
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={basePath || "/"}>{tnf("backHome")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
